var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UserController');
var authMiddleware = require('../../../shared/middleware/authMiddleware');

router.post('/register', UserController.registerUser);

router.post('/login', UserController.loginUser);

router.get('/profile',
  authMiddleware.authenticateJWT,
  UserController.getCurrentUser
);

router.put('/profile',
  authMiddleware.authenticateJWT,
  UserController.updateProfile
);

router.put('/change-password',
  authMiddleware.authenticateJWT,
  UserController.changePassword
);

router.get('/:userId',
  authMiddleware.authenticateJWT,
  UserController.getUserById
);

router.get('/roles/students',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['teacher', 'admin']),
  UserController.getStudents
);

router.get('',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  UserController.getUsers
);

router.post('',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  UserController.createUserByAdmin
);

router.put('/admin/:userId',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  UserController.updateUserByAdmin
);

router.delete('/:userId',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  UserController.deleteUser
);

router.get('/roles/teachers',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  UserController.getTeachers
);

router.get('/admin/statistics',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin']),
  UserController.getUserStatistics
);

module.exports = router;
