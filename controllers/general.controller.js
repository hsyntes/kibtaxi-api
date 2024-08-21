exports.checkApiKey = function (req, res, next) {
  try {
    const { API_KEY } = req.query;

    if (API_KEY == process.env.API_KEY) return next();

    return res.status(401).json({
      status: "fail",
      message: "Invalid API KEY!",
    });
  } catch (e) {
    next(e);
  }
};
