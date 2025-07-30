var UserModel = require('../models/UserModel');
var Utils = require('../../../shared/utils');

var UserRepository = {
  findById: function (userId, includePassword) {
    if (includePassword === undefined) {
      includePassword = false;
    }

    var query = UserModel.findById(userId);

    if (!includePassword) {
      query = query.select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');
    }

    return query.lean();
  },

  findByEmail: function (email, includePassword) {
    if (includePassword === undefined) {
      includePassword = false;
    }

    var query = UserModel.findByEmail(email);

    if (!includePassword) {
      query = query.select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');
    }

    return query.lean();
  },

  create: function (userData) {
    return UserModel.create(userData);
  },

  update: function (userId, updateData, returnNew) {
    if (returnNew === undefined) {
      returnNew = true;
    }

    return UserModel
      .findByIdAndUpdate(userId, updateData, { new: returnNew })
      .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken')
      .lean();
  },

  deleteById: function (userId) {
    return this.update(userId, { isActive: false });
  },

  hardDeleteById: function (userId) {
    return UserModel.deleteOne({ _id: userId });
  },

  findWithFilters: function (filters, options) {
    if (options === undefined) {
      options = {};
    }

    // Build query
    var query = {};

    // Text search in name and email
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Role filter
    if (filters.roles) {
      query.roles = filters.roles;
    }

    // Active status filter
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Email verified filter
    if (filters.isEmailVerified !== undefined) {
      query.isEmailVerified = filters.isEmailVerified;
    }

    var mongoQuery = UserModel.find(query);

    // Apply selection (exclude sensitive fields)
    mongoQuery = mongoQuery.select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken');

    // Apply sorting
    var sortObj = {};
    if (options.sortBy && options.sortOrder) {
      sortObj[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObj.createdAt = -1;
    }
    mongoQuery = mongoQuery.sort(sortObj);

    // Apply pagination
    if (options.page && options.limit) {
      var skip = (options.page - 1) * options.limit;
      mongoQuery = mongoQuery.skip(skip).limit(options.limit);
    }

    return mongoQuery.lean();
  },

  countWithFilters: function (filters) {
    var query = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    if (filters.roles) {
      query.roles = filters.roles;
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.isEmailVerified !== undefined) {
      query.isEmailVerified = filters.isEmailVerified;
    }

    return UserModel.countDocuments(query);
  },

  findActiveUsers: function (additionalFilters, options) {
    var filters = Object.assign({ isActive: true }, additionalFilters || {});
    return this.findWithFilters(filters, options);
  },

  findByRole: function (role, options) {
    return this.findWithFilters({ roles: role, isActive: true }, options);
  },

  updateLoginInfo: function (userId) {
    var updateData = {
      lastLogin: new Date(),
      $inc: { loginCount: 1 }
    };
    return this.update(userId, updateData);
  },

  setResetPasswordToken: function (userId, token, expires) {
    var updateData = {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    };
    return UserModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
  },

  findByResetToken: function (token) {
    return UserModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      })
      .lean();
  },

  clearResetPasswordToken: function (userId) {
    var updateData = {
      $unset: {
        resetPasswordToken: 1,
        resetPasswordExpires: 1
      }
    };
    return UserModel.findByIdAndUpdate(userId, updateData, { new: true }).lean();
  },

  setEmailVerificationToken: function (userId, token) {
    return this.update(userId, { emailVerificationToken: token });
  },

  verifyEmailByToken: function (token) {
    return UserModel
      .findOneAndUpdate(
        { emailVerificationToken: token },
        {
          isEmailVerified: true,
          $unset: { emailVerificationToken: 1 }
        },
        { new: true }
      )
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
  },

  changePassword: function (userId, newPassword) {
    return UserModel
      .findById(userId)
      .then(function (user) {
        if (!user) {
          return null;
        }
        user.password = newPassword;
        return user.save();
      })
      .then(function (user) {
        return user ? user.toSafeObject() : null;
      });
  }
};

module.exports = UserRepository;
