const AppError = require("../errors/AppError");
const Response = require("../utils/Response");

// ! 403: Forbidden
const validationError = (err) => {
  const messages = err.message.split(",");

  const message = messages
    .map((message, index) => message.split(":").at(index === 0 ? 2 : 1))
    .join()
    .trim();

  return new AppError(403, "fail", message);
};

// ! 409: Duplicate Key
const duplicateKeyError = (err) => {
  if (err.keyPattern.hasOwnProperty("taxi_name"))
    return new AppError(409, "fail", "This taxi name has already taken.");

  if (err.keyPattern.hasOwnProperty("taxi_phone"))
    return new AppError(409, "fail", "This phone number is already in use.");

  if (err.keyPattern.hasOwnProperty("taxi_whatsapp"))
    return new AppError(409, "fail", "This whatsapp number is already in use.");

  if (err.keyPattern.hasOwnProperty("taxi_email"))
    return new AppError(409, "fail", "This email is already in use.");

  if (err.keyPattern.hasOwnProperty("taxi_website"))
    return new AppError(409, "fail", "This taxi website is already in use.");

  if (err.keyPattern.hasOwnProperty("taxi_instagram"))
    return new AppError(
      409,
      "fail",
      "This instagram account is already in use."
    );
};

module.exports = function (err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") err = validationError(err);
  if (err.code === 11000) err = duplicateKeyError(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  Response.send(res, err.statusCode, err.status, err.message);

  next();
};
