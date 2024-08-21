module.exports = function (err, req, res, next) {
  console.error(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  next();
};
