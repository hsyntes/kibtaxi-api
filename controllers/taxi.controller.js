const Taxi = require("../models/Taxi");
const sharp = require("sharp");
const AWS = require("../aws.config");
const { promisify } = require("util");
const AppError = require("../errors/AppError");
const Response = require("../utils/Response");

exports.getTaxis = async function (req, res, next) {
  try {
    const { lat, long } = req.query;

    if (!lat || !long)
      return next(
        new AppError(
          403,
          "fail",
          "Please specify valid latitude and longitude values to get taxis around your location."
        )
      );

    const latitude = Number(lat);
    const longitude = Number(long);

    const taxis = await Taxi.find({
      taxi_location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 12500,
        },
      },
    });

    Response.send(res, 200, "success", undefined, taxis.length, { taxis });
  } catch (e) {
    next(e);
  }
};

// * GET one document by id
exports.getTaxi = async function (req, res, next) {
  try {
    const taxi = await Taxi.findById(req.params.id);
    Response.send(res, 200, "success", undefined, undefined, { taxi });
  } catch (e) {
    next(e);
  }
};

// * CREATE a document
exports.createTaxi = async function (req, res, next) {
  try {
    const {
      taxi_name,
      taxi_description,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_email,
      taxi_website,
      taxi_instagram,
    } = req.body;

    const taxi = await Taxi.create({
      taxi_name,
      taxi_description,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_email,
      taxi_website,
      taxi_instagram,
    });

    Response.send(
      res,
      201,
      "success",
      "Creation taxi has been done successfully!",
      undefined,
      { taxi }
    );
  } catch (e) {
    next(e);
  }
};

// * Update document by id
exports.updateTaxi = async function (req, res, next) {
  try {
    const {
      taxi_name,
      taxi_profile,
      taxi_description,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_email,
      taxi_website,
      taxi_instagram,
      taxi_photos,
    } = req.body;

    const taxi = await Taxi.findByIdAndUpdate(req.params.id, {
      taxi_name,
      taxi_profile,
      taxi_description,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_email,
      taxi_website,
      taxi_instagram,
      taxi_photos,
    });

    Response.send(
      res,
      201,
      "success",
      "The taxi has been updated successfully!",
      undefined,
      { taxi }
    );
  } catch (e) {
    next(e);
  }
};

// * Upload profile picture
exports.uploadTaxiProfile = async function (req, res, next) {
  try {
    if (!req.params.id)
      return next(
        new AppError(403, "fail", "Please specify a valid taxi id to upload.")
      );

    if (!req.file || req.file.fieldname !== "profile_photo")
      return next(
        new AppError(403, "fail", "Please select a profile picture to upload.")
      );

    const taxi = await Taxi.findById(req.params.id);

    const photo = await sharp(req.file.buffer)
      .resize({
        width: 350,
        height: 350,
        fit: "cover",
      })
      .toFormat("png")
      .png({ quality: 100 })
      .toBuffer();

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `taxis/${taxi._id}/profile/${taxi._id}.png`,
      Body: photo,
    };

    const S3 = new AWS.S3();
    S3.upload(params, async function (err, data) {
      if (err)
        return next(
          new AppError(422, "fail", `Profile picture couldn't uploaded: ${err}`)
        );

      const url = data.Location;

      taxi.taxi_profile = url;
      await taxi.save();

      Response.send(
        res,
        201,
        "success",
        "Your profile picture has been uploaded successfully!",
        undefined,
        { taxi }
      );
    });
  } catch (e) {
    next(e);
  }
};

// * Upload photos
exports.uploadTaxiPhotos = async function (req, res, next) {
  try {
    if (!req.files || req.files.length === 0)
      return next(
        new AppError(403, "fail", "Please select at least one image.")
      );

    const taxi = await Taxi.findById(req.params.id);

    const S3 = new AWS.S3();
    const upload = promisify(S3.upload.bind(S3));

    const taxi_photos = [];

    await Promise.all(
      req.files.map(async function (file, index) {
        const taxi_photo = await sharp(file.buffer)
          .resize({
            width: 1080,
            height: 1350,
            fit: "cover",
          })
          .toFormat("jpg")
          .jpeg({ quality: 100 })
          .toBuffer();

        const params = {
          Bucket: process.env.AWS_BUCKET,
          Key: `taxis/${taxi._id}/photos/${index}.jpg`,
          Body: taxi_photo,
        };

        try {
          const data = await upload(params);
          const url = data.Location;

          taxi_photos.push(url);
        } catch (e) {
          return next(e);
        }
      })
    );

    taxi.taxi_photos = taxi_photos;
    await taxi.save();

    Response.send(
      res,
      201,
      "success",
      "The photos has been uploaded successfully!",
      undefined,
      { taxi }
    );
  } catch (e) {
    next(e);
  }
};
