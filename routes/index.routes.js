const router = require("express").Router();

const { checkApiKey } = require("../middlewares/index.middlewares");
const { checkApiHealth } = require("../controllers/index.controllers");

// * Check API Key Middleware
router.use(checkApiKey);

// * Check API Health
router.get("/", checkApiHealth);

// * API Route(s)
router.use("/taxis", require("./taxi/taxi.routes"));

module.exports = router;
