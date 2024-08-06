const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer({ storage: multer.memoryStorage() });

const {
  getTaxis,
  getTaxi,
  updateTaxi,
  createTaxi,
  uploadTaxiProfile,
} = require("../../controllers/taxi.controller");

// * Endpoint(s)
router.route("/").get(getTaxis).post(createTaxi);
router.route("/:id").get(getTaxi).patch(updateTaxi).put(updateTaxi);
router
  .route("/:id/upload/profile")
  .post(storage.single("profile_photo"), uploadTaxiProfile);

module.exports = router;
