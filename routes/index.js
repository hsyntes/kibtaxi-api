const router = require("express").Router();
const { checkApiKey } = require("../controllers/general.controller");

router.use(checkApiKey);

router.get("/", function (req, res, next) {
  res.status(200).json({
    status: "success",
    message: "OK",
  });

  next();
});

module.exports = router;
