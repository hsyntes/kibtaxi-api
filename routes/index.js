const express = require("express");
const router = express.Router();
const Response = require("../utils/Response");

// * API Health
router.get("/", function (req, res, next) {
  Response.send(res, 200, "success", "OK!");
});

// * API Endpoints
router.use("/taxis", require("./taxis"));

module.exports = router;
