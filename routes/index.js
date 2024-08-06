const express = require("express");
const Response = require("../utils/Response");
const router = express.Router();

// * API Health
router.get("/", function (req, res, next) {
  Response.send(res, 200, "success", "OK!");
});

// * API Endpoints
router.use("/taxis", require("./taxis"));

module.exports = router;
