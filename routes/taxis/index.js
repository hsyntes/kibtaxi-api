const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer({ storage: multer.memoryStorage() });

const {
  getTaxis,
  getTaxi,
  getPopularTaxis,
  updateTaxi,
  createTaxi,
  uploadTaxiProfile,
  uploadTaxiPhotos,
  deleteTaxi,
} = require("../../controllers/taxi.controller");

// * Endpoint(s)
router.get("/", getTaxis);
router.get("/id/:id", getTaxi);
router.get("/popular", getPopularTaxis);
router.post("/create", createTaxi);

router.post(
  "/upload/profile/:id",
  storage.single("profile_photo"),
  uploadTaxiProfile
);

router.post(
  "/upload/photos/:id",
  storage.array("taxi_photos", 8),
  uploadTaxiPhotos
);

router.route("/update/:id").put(updateTaxi).patch(updateTaxi);
router.delete("/delete/:id", deleteTaxi);

module.exports = router;
