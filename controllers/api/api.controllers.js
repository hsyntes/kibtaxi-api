const Response = require("../../utils/Response");

exports.checkApiHealth = function (req, res, next) {
  try {
    Response.send(res, 200, "success", "OK");
  } catch (e) {
    next(e);
  }
};
