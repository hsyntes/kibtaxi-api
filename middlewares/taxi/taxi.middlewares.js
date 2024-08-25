exports.checkTaxiCoordinates = async function (req, res, next) {
  try {
    if (!req.query.lat || !req.query.long)
      return next(
        new AppError(
          403,
          "fail",
          "Both latitude & longitude values are required."
        )
      );

    next();
  } catch (e) {
    next(e);
  }
};
