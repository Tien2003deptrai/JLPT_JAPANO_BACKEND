var jwt = require('jsonwebtoken');
var ApiResponse = require('../response/ApiResponse');

function authenticateJWT(req, res, next) {
  try {
    var authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Unauthorized: No valid token provided', 401);
    }

    var token = authHeader.split(' ')[1];

    if (!token || token.split('.').length !== 3) {
      return ApiResponse.error(res, 'Unauthorized: Invalid token format', 401);
    }

    var decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (error) {
      return ApiResponse.error(res, 'Unauthorized: Invalid or expired token', 401);
    }

    if (!decoded || !decoded.id) {
      return ApiResponse.error(res, 'Invalid token payload', 401);
    }

    req.user = {
      userId: decoded.id,
      email: decoded.email,
      roles: decoded.roles
    };

    next();
  } catch (error) {
    console.log('Error in authenticateJWT:', error.message);
    return ApiResponse.error(res, 'Server error while authenticating', 500);
  }
}

function authorizeRoles(allowedRoles) {
  return function (req, res, next) {
    if (!req.user || !req.user.roles) {
      return ApiResponse.error(res, 'Forbidden: User role not found', 403);
    }

    if (!allowedRoles.includes(req.user.roles)) {
      return ApiResponse.error(res, 'Forbidden: Access denied', 403);
    }

    next();
  };
}

module.exports = {
  authenticateJWT: authenticateJWT,
  authorizeRoles: authorizeRoles
};
