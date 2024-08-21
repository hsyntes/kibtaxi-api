const Response = require("../../utils/Response");

exports.checkApiKey = function (req, res, next) {
  try {
    const { API_KEY } = req.query;

    if (API_KEY == process.env.API_KEY) return next();

    Response.send(res, 401, "fail", "Invalid API KEY!");
  } catch (e) {
    next(e);
  }
};

exports.checkApiKey = function (req, res, next) {
  try {
    Response.send(res, 200, "success", "OK");
  } catch (e) {
    next(e);
  }
};
