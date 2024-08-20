const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const expressRateLimit = require("express-rate-limit");
const helmet = require("helmet");
const hpp = require("hpp");
const xssClean = require("xss-clean");
const http = require("http");
const routes = require("./routes");
const AppError = require("./errors/AppError");
const mongoose = require("mongoose");
const errorController = require("./controllers/error.controller");

// * ENV Variables
dotenv.config({ path: "./config.env" });

// * Express
const app = express();

// * CORS Configuration
app.use(cors({ origin: "*" }));

// * API Limit
const limit = expressRateLimit({
  max: 1000,
  windowsMs: 60 * 60 * 1000,
  message: "Too mant requests!",
  standartHeaders: true,
  legeacyHeaders: false,
});

app.use(express.json({ limit }));

// * API Security
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(hpp());
app.use(xssClean());

// * Server
const server = http.createServer(app);
server.listen(process.env.PORT, () =>
  console.log(`Server is runnnig on PORT: ${process.env.PORT}`)
);

// * API Routes
app.use("/api", routes);

// * Undefined API Routes
app.all("*", (req, res, next) =>
  next(new AppError(404, "fail", `Unsupported API Route: ${req.originalUrl}`))
);

// * MongoDB Connection
(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connection to the MongoDB is successful.");
  } catch (e) {
    console.error(`Connection to the MongoDB is failed: ${e}`);
  }
})();

// ! Uncaught Exception
process.on("uncaughtException", function (err) {
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// ! Unhandled Rejection
process.on("unhandledRejection", function (err) {
  console.error(err.name, err.message);
  server.close(process.exit(1));
});

// ! Error Handling
app.use(errorController);
