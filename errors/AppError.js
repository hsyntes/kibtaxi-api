// * Inheritance JavaScript Error Class
module.exports = class AppError extends Error {
  constructor(statusCode, status, message) {
    // * Inherit the error message
    super(message);

    this.statusCode = statusCode;
    this.status = status;

    // * Subscribing this class to JavaScript Error Class
    Error.captureStackTrace(this, this.constructor);
  }
};
