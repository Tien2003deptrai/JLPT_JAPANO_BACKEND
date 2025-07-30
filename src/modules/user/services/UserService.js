var UserRepository = require('../repositories/UserRepository');
var UserDto = require('../dtos/UserDto');
var Utils = require('../../../shared/utils');
var throwError = require('../../../shared/errors/throwError');
var crypto = require('crypto');

var UserService = {
  registerUser: function (userData) {
    return new Promise(function (resolve, reject) {
      try {
        var registerDto = new UserDto.RegisterUserDto(userData);

        if (!registerDto.name || !registerDto.email || !registerDto.password) {
          throwError('Tên, email và mật khẩu bắt buộc');
        }

        var emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(registerDto.email)) {
          throwError('Email không hợp lệ');
        }

        if (registerDto.password.length < 6) {
          throwError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        UserRepository.findByEmail(registerDto.email)
          .then(function (existingUser) {
            if (existingUser) {
              throwError('Email này đã được sử dụng', 409);
            }

            return UserRepository.create(registerDto);
          })
          .then(function (createdUser) {
            var userResponse = new UserDto.UserResponseDto(createdUser.toSafeObject());
            resolve(userResponse);
          })
          .catch(function (error) {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  loginUser: function (loginData) {
    return new Promise(function (resolve, reject) {
      try {
        var loginDto = new UserDto.LoginUserDto(loginData);

        if (!loginDto.email || !loginDto.password) {
          throwError('Email và mật khẩu bắt buộc');
        }

        UserRepository.findByEmail(loginDto.email, true)
          .then(function (user) {
            if (!user) {
              throwError('Email hoặc mật khẩu không đúng', 401);
            }

            if (!user.isActive) {
              throwError('Tài khoản đã bị vô hiệu hóa', 401);
            }

            return UserRepository.findById(user._id, true)
              .then(function (userWithPassword) {
                var UserModel = require('../models/UserModel');
                var userDoc = new UserModel(userWithPassword);

                return new Promise(function (resolvePassword, rejectPassword) {
                  userDoc.comparePassword(loginDto.password, function (err, isMatch) {
                    if (err) {
                      return rejectPassword(err);
                    }

                    if (!isMatch) {
                      return rejectPassword(new Error('Email hoặc mật khẩu không đúng'));
                    }

                    resolvePassword(user);
                  });
                });
              });
          })
          .then(function (user) {
            return UserRepository.updateLoginInfo(user._id)
              .then(function (updatedUser) {
                var token = Utils.generateToken({
                  _id: user._id,
                  email: user.email,
                  roles: user.roles
                });

                var loginResponse = new UserDto.LoginResponseDto({
                  token: token,
                  user: updatedUser || user,
                  expiresIn: '7d'
                });

                resolve(loginResponse);
              });
          })
          .catch(function (error) {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getUserProfile: function (userId) {
    return new Promise(function (resolve, reject) {
      if (!userId) {
        return reject(new Error('User ID bắt buộc'));
      }

      UserRepository.findById(userId)
        .then(function (user) {
          if (!user) {
            throwError('Không tìm thấy người dùng', 404);
          }

          var userResponse = new UserDto.UserResponseDto(user);
          resolve(userResponse);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  updateUserProfile: function (userId, updateData) {
    return new Promise(function (resolve, reject) {
      if (!userId) {
        return reject(new Error('User ID bắt buộc'));
      }

      var updateDto = new UserDto.UpdateUserProfileDto(updateData);

      if (updateDto.email) {
        var emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(updateDto.email)) {
          return reject(new Error('Email không hợp lệ'));
        }

        UserRepository.findByEmail(updateDto.email)
          .then(function (existingUser) {
            if (existingUser && existingUser._id.toString() !== userId) {
              throwError('Email này đã được sử dụng', 409);
            }

            return UserRepository.update(userId, updateDto);
          })
          .then(function (updatedUser) {
            if (!updatedUser) {
              throwError('Không tìm thấy người dùng', 404);
            }

            var userResponse = new UserDto.UserResponseDto(updatedUser);
            resolve(userResponse);
          })
          .catch(function (error) {
            reject(error);
          });
      } else {
        UserRepository.update(userId, updateDto)
          .then(function (updatedUser) {
            if (!updatedUser) {
              throwError('Không tìm thấy người dùng', 404);
            }

            var userResponse = new UserDto.UserResponseDto(updatedUser);
            resolve(userResponse);
          })
          .catch(function (error) {
            reject(error);
          });
      }
    });
  },

  changePassword: function (userId, passwordData) {
    return new Promise(function (resolve, reject) {
      try {
        var changePasswordDto = new UserDto.ChangePasswordDto(passwordData);

        if (!changePasswordDto.currentPassword || !changePasswordDto.newPassword || !changePasswordDto.confirmPassword) {
          throwError('Tất cả các trường mật khẩu bắt buộc');
        }

        if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
          throwError('Mật khẩu xác nhận không khớp');
        }

        if (changePasswordDto.newPassword.length < 6) {
          throwError('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        UserRepository.findById(userId, true)
          .then(function (user) {
            if (!user) {
              throwError('Không tìm thấy người dùng', 404);
            }

            var UserModel = require('../models/UserModel');
            var userDoc = new UserModel(user);

            return new Promise(function (resolvePassword, rejectPassword) {
              userDoc.comparePassword(changePasswordDto.currentPassword, function (err, isMatch) {
                if (err) {
                  return rejectPassword(err);
                }

                if (!isMatch) {
                  return rejectPassword(new Error('Mật khẩu hiện tại không đúng'));
                }

                resolvePassword();
              });
            });
          })
          .then(function () {
            return UserRepository.changePassword(userId, changePasswordDto.newPassword);
          })
          .then(function (updatedUser) {
            resolve({ success: true, message: 'Đổi mật khẩu thành công' });
          })
          .catch(function (error) {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getUsersWithFilters: function (filters) {
    return new Promise(function (resolve, reject) {
      var filtersDto = new UserDto.UserFiltersDto(filters);

      var queryFilters = {
        search: filtersDto.search,
        roles: filtersDto.roles,
        isActive: filtersDto.isActive,
        isEmailVerified: filtersDto.isEmailVerified
      };

      var options = {
        page: filtersDto.page,
        limit: filtersDto.limit,
        sortBy: filtersDto.sortBy,
        sortOrder: filtersDto.sortOrder
      };

      Promise.all([
        UserRepository.findWithFilters(queryFilters, options),
        UserRepository.countWithFilters(queryFilters)
      ])
        .then(function (results) {
          var users = results[0];
          var total = results[1];

          var userDtos = users.map(function (user) {
            return new UserDto.UserListDto(user);
          });

          resolve({
            users: userDtos,
            pagination: {
              total: total,
              page: filtersDto.page,
              limit: filtersDto.limit,
              totalPages: Math.ceil(total / filtersDto.limit)
            }
          });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  updateUserByAdmin: function (userId, updateData) {
    return new Promise(function (resolve, reject) {
      if (!userId) {
        return reject(new Error('User ID bắt buộc'));
      }

      var updateDto = new UserDto.UpdateUserAdminDto(updateData);

      if (updateDto.roles) {
        var validRoles = ['student', 'teacher', 'admin'];
        if (!validRoles.includes(updateDto.roles)) {
          return reject(new Error('Role không hợp lệ'));
        }
      }

      if (updateDto.email) {
        var emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(updateDto.email)) {
          return reject(new Error('Email không hợp lệ'));
        }
      }

      UserRepository.update(userId, updateDto)
        .then(function (updatedUser) {
          if (!updatedUser) {
            throwError('Không tìm thấy người dùng', 404);
          }

          var userResponse = new UserDto.UserResponseDto(updatedUser);
          resolve(userResponse);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  deleteUser: function (userId) {
    return new Promise(function (resolve, reject) {
      if (!userId) {
        return reject(new Error('User ID bắt buộc'));
      }

      UserRepository.deleteById(userId)
        .then(function (result) {
          if (!result) {
            throwError('Không tìm thấy người dùng', 404);
          }
          resolve({ success: true, message: 'Xóa người dùng thành công' });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getUserStatistics: function () {
    return new Promise(function (resolve, reject) {
      Promise.all([
        UserRepository.countWithFilters({}),
        UserRepository.countWithFilters({ isActive: true }),
        UserRepository.countWithFilters({ roles: 'student' }),
        UserRepository.countWithFilters({ roles: 'teacher' }),
        UserRepository.countWithFilters({ roles: 'admin' }),
        UserRepository.countWithFilters({ isEmailVerified: true })
      ])
        .then(function (results) {
          resolve({
            totalUsers: results[0],
            activeUsers: results[1],
            students: results[2],
            teachers: results[3],
            admins: results[4],
            verifiedEmails: results[5]
          });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
};

module.exports = UserService;
