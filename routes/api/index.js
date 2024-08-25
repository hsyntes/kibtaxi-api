const router = require("express").Router();

const { checkApiKey } = require("../../middlewares/api/api.middlewares");
const { checkApiHealth } = require("../../controllers/api/api.controllers");

// * Check API Key Middleware
router.use(checkApiKey);

// * Check API Health
router.get("/", checkApiHealth);

// * API Route(s)
router.use("/taxis", require("./taxi/taxi.routes"));

module.exports = router;
