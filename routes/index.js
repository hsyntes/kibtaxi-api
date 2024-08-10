const express = require("express");
const router = express.Router();
const Response = require("../utils/Response");

// * API Health
router.get("/", function (req, res, next) {
  try {
    console.log("Connection to the server is successful.");
    Response.send(res, 200, "success", "OK!");
  } catch (e) {
    console.error("Connection to the server is failed.");
  }
});

// * API Endpoints
router.use("/taxis", require("./taxis"));

module.exports = router;
