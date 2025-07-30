var UserService = require('../services/UserService');
var handleRequest = require('../../../shared/utils/baseController');
var throwError = require('../../../shared/errors/throwError');

var UserController = {
  registerUser: function (req, res) {
    return handleRequest(res, function () {
      var userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        roles: req.body.roles
      };

      return UserService.registerUser(userData);
    }, 'Đăng ký thành công');
  },

  loginUser: function (req, res) {
    return handleRequest(res, function () {
      var loginData = {
        email: req.body.email,
        password: req.body.password
      };

      return UserService.loginUser(loginData);
    }, 'Đăng nhập thành công');
  },

  getCurrentUser: function (req, res) {
    return handleRequest(res, function () {
      return UserService.getUserProfile(req.user.userId);
    }, 'Thông tin người dùng');
  },

  getUserById: function (req, res) {
    return handleRequest(res, function () {
      return UserService.getUserProfile(req.params.userId);
    }, 'Thông tin người dùng');
  },

  updateProfile: function (req, res) {
    return handleRequest(res, function () {
      var updateData = {
        name: req.body.name,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        address: req.body.address,
        avatar: req.body.avatar,
        profile: req.body.profile
      };

      return UserService.updateUserProfile(req.user.userId, updateData);
    }, 'Cập nhật thông tin thành công');
  },

  changePassword: function (req, res) {
    return handleRequest(res, function () {
      var passwordData = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword
      };

      return UserService.changePassword(req.user.userId, passwordData);
    }, 'Đổi mật khẩu thành công');
  },

  getUsers: function (req, res) {
    return handleRequest(res, function () {
      // Check admin permission
      if (req.user.roles !== 'admin') {
        throwError('Không có quyền truy cập', 403);
      }

      var filters = {
        search: req.query.search,
        roles: req.query.roles,
        isActive: req.query.isActive,
        isEmailVerified: req.query.isEmailVerified,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      return UserService.getUsersWithFilters(filters);
    }, 'Danh sách người dùng');
  },

  updateUserByAdmin: function (req, res) {
    return handleRequest(res, function () {
      // Check admin permission
      if (req.user.roles !== 'admin') {
        throwError('Không có quyền cập nhật người dùng', 403);
      }

      var updateData = {
        name: req.body.name,
        email: req.body.email,
        roles: req.body.roles,
        isActive: req.body.isActive,
        isEmailVerified: req.body.isEmailVerified,
        phone: req.body.phone,
        address: req.body.address
      };

      return UserService.updateUserByAdmin(req.params.userId, updateData);
    }, 'Cập nhật người dùng thành công');
  },

  deleteUser: function (req, res) {
    return handleRequest(res, function () {
      // Check admin permission
      if (req.user.roles !== 'admin') {
        throwError('Không có quyền xóa người dùng', 403);
      }

      // Prevent admin from deleting themselves
      if (req.params.userId === req.user.userId) {
        throwError('Không thể xóa chính mình', 400);
      }

      return UserService.deleteUser(req.params.userId);
    }, 'Xóa người dùng thành công');
  },

  getUserStatistics: function (req, res) {
    return handleRequest(res, function () {
      // Check admin permission
      if (req.user.roles !== 'admin') {
        throwError('Không có quyền xem thống kê', 403);
      }

      return UserService.getUserStatistics();
    }, 'Thống kê người dùng');
  },

  getStudents: function (req, res) {
    return handleRequest(res, function () {
      // Check permission
      if (req.user.roles !== 'admin' && req.user.roles !== 'teacher') {
        throwError('Không có quyền xem danh sách học sinh', 403);
      }

      var filters = {
        roles: 'student',
        isActive: true,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };

      return UserService.getUsersWithFilters(filters);
    }, 'Danh sách học sinh');
  },

  getTeachers: function (req, res) {
    return handleRequest(res, function () {
      // Check admin permission
      if (req.user.roles !== 'admin') {
        throwError('Không có quyền xem danh sách giáo viên', 403);
      }

      var filters = {
        roles: 'teacher',
        isActive: true,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };

      return UserService.getUsersWithFilters(filters);
    }, 'Danh sách giáo viên');
  },

  createUserByAdmin: function (req, res) {
    return handleRequest(res, function () {
      // Check admin permission
      if (req.user.roles !== 'admin') {
        throwError('Không có quyền tạo người dùng', 403);
      }

      var userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password || 'defaultpassword123',
        roles: req.body.roles || 'student',
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        address: req.body.address
      };

      return UserService.registerUser(userData);
    }, 'Tạo người dùng thành công');
  }
};

module.exports = UserController;
