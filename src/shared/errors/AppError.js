class AppError extends Error {
  constructor(message, statusCode = 400, isOperational = true) {
    super(message);

    this.statusCode = Number.isInteger(statusCode) ? statusCode : 400;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
