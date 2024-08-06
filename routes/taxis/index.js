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
  uploadTaxiPhotos,
} = require("../../controllers/taxi.controller");

// * Endpoint(s)
router.route("/").get(getTaxis).post(createTaxi);
router.route("/:id").get(getTaxi).patch(updateTaxi).put(updateTaxi);
router.post(
  "/:id/upload/profile",
  storage.single("profile_photo"),
  uploadTaxiProfile
);
router.post(
  "/:id/upload/photos",
  storage.array("taxi_photos", 8),
  uploadTaxiPhotos
);

module.exports = router;
