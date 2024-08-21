const Response = require("../../utils/Response");

module.exports = function (err, req, res, next) {
  console.error(err);

  Response.send(res, err.statusCode, err.status, err.message);

  next();
};
