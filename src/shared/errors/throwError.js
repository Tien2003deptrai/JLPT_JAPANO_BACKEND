var AppError = require('./AppError');

function throwError(message, statusCode) {
  if (statusCode === undefined) {
    statusCode = 400;
  }
  throw new AppError(message, statusCode);
}

module.exports = throwError;
