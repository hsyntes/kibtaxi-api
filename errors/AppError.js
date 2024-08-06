// * AppError class by extending JavaScript Error class
module.exports = class AppError extends Error {
  constructor(statusCode, status, message) {
    // * Inheritance
    super(message);

    this.statusCode = statusCode;
    this.status = status;

    // * Subscribing this error class to the JavaScript Error Stack Trace
    Error.captureStackTrace(this, this.constructor);
  }
};
