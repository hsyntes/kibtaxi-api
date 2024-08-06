const Taxi = require("../models/Taxi");
const sharp = require("sharp");
const AppError = require("../errors/AppError");
const AWS = require("../aws.config");
const Response = require("../utils/Response");

// * GET ALL
exports.getTaxis = async function (req, res, next) {
  try {
    const taxis = await Taxi.find();

    Response.send(res, 200, "success", undefined, taxis.length, { taxis });
  } catch (e) {
    next(e);
  }
};

// * GET One
exports.getTaxi = async function (req, res, next) {
  try {
    const taxi = await Taxi.findById(req.params.id);
    Response.send(res, 200, "success", undefined, undefined, { taxi });
  } catch (e) {
    next(e);
  }
};

// * CREATE
exports.createTaxi = async function (req, res, next) {
  try {
    const {
      taxi_name,
      taxi_description,
      taxi_location,
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

// * UPDATE
exports.updateTaxi = async function (req, res, next) {
  try {
    const {
      taxi_name,
      taxi_profile,
      taxi_description,
      taxi_location,
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

// * UPLOAD
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
