var ApiResponse = require('../response/ApiResponse');

function handleRequest(res, serviceMethod, successMessage) {
  return serviceMethod()
    .then(function (data) {
      return ApiResponse.success(res, successMessage, data);
    })
    .catch(function (error) {
      console.error('Controller Error:', error);
      return ApiResponse.error(res, error.message || 'Lỗi hệ thống', error.statusCode || 500);
    });
}

module.exports = handleRequest;
