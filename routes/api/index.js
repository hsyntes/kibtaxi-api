const router = require("express").Router();
const { checkApiKey } = require("../../controllers/api/api.controllers");

// * Check API Key Middleware
router.use(checkApiKey);

// * API Health
router.get("/", checkApiKey);

module.exports = router;
