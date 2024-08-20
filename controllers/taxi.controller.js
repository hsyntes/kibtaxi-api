const Taxi = require("../models/Taxi");
const sharp = require("sharp");
const AWS = require("../aws.config");
const { promisify } = require("util");
const AppError = require("../errors/AppError");
const Response = require("../utils/Response");

// * GET all documents
exports.getTaxis = async function (req, res, next) {
  try {
    const { page, limit, lat, long } = req.query;

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

    const countTaxiDocuments = await Taxi.countDocuments();
    const taxis = await Taxi.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: 35000,
          spherical: true,
        },
      },
      {
        $sample: { size: countTaxiDocuments },
      },
      {
        $project: { taxi_photos: 0 },
      },
      {
        $skip: (Number(page) - 1) * Number(limit),
      },
      {
        $limit: Number(limit),
      },
    ]);

    const totalPages = Math.ceil(countTaxiDocuments / Number(limit));

    Response.send(res, 200, "success", undefined, taxis.length, {
      currentPage: Number(page),
      countTaxiDocuments,
      totalPages,
      taxis,
    });
  } catch (e) {
    next(e);
  }
};

// * GET all documents by filtering
exports.getPopularTaxis = async function (req, res, next) {
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

    const taxis = await Taxi.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",
          maxDistance: 35000,
          spherical: true,
        },
      },
      {
        $sort: { taxi_popularity: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: { taxi_photos: 0 },
      },
    ]);

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
      taxi_username,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_address,
      taxi_popularity,
    } = req.body;

    const taxi = await Taxi.create({
      taxi_name,
      taxi_username,
      taxi_location,
      taxi_city,
      taxi_phone: `+90${taxi_phone}`,
      taxi_whatsapp,
      taxi_address,
      taxi_popularity,
    });

    if (!taxi.taxi_whatsapp) {
      taxi.taxi_whatsapp = taxi.taxi_phone;
      await taxi.save({ validateBeforeSave: true });
    }

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
      taxi_username,
      taxi_profile,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_address,
      taxi_photos,
      taxi_popularity,
    } = req.body;

    const taxi = await Taxi.findByIdAndUpdate(req.params.id, {
      taxi_name,
      taxi_username,
      taxi_profile,
      taxi_location,
      taxi_city,
      taxi_phone,
      taxi_whatsapp,
      taxi_address,
      taxi_photos,
      taxi_popularity,
    });

    if (!taxi.taxi_whatsapp) {
      taxi.taxi_whatsapp = taxi.taxi_phone;
      await taxi.save({ validateBeforeSave: true });
    }

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

// * DELETE document by id
exports.deleteTaxi = async function (req, res, next) {
  try {
    if (!req.params.id)
      return next(
        new AppError(
          403,
          "fail",
          "Please specify which taxi do you want to delete."
        )
      );

    const S3 = new AWS.S3();

    // * Listing specific AWS S3 Bucket Objects
    const listObjectsV2 = await S3.listObjectsV2({
      Bucket: process.env.AWS_BUCKET,
      Prefix: `taxis/${req.params.id}`,
    }).promise();

    // ! Delete objects under specific AWS S3 Bucket
    await S3.deleteObjects({
      Bucket: process.env.AWS_BUCKET,
      Delete: {
        Objects: listObjectsV2.Contents.map((objectV2) => ({
          Key: objectV2.Key,
        })),
      },
    }).promise();

    await Taxi.findByIdAndDelete(req.params.id);

    Response.send(res, 204);
  } catch (e) {
    next(e);
  }
};
