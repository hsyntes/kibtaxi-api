const express = require("express");
const router = express.Router();

const {
  checkTaxiCoordinates,
} = require("../../middlewares/taxi/taxi.middlewares");
const { getTaxis } = require("../../controllers/taxi/taxi.controllers");

router.use(checkTaxiCoordinates);
router.get("/", getTaxis);

module.exports = router;
