const Response = require("../utils/Response");

exports.checkApiHealth = function (req, res, next) {
  try {
    console.log("Connection to the server is successful.");
    Response.send(res, 200, "success", "OK");
  } catch (e) {
    next(e);
  }
};
