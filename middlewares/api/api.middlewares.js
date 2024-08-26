const Response = require("../../utils/Response");

exports.checkApiKey = function (req, res, next) {
  try {
    const { API_KEY } = req.query;

    if (API_KEY == process.env.API_KEY) return next();

    console.error("Invalid API KEY!");
    Response.send(res, 401, "fail", "Invalid API KEY!");
  } catch (e) {
    next(e);
  }
};
