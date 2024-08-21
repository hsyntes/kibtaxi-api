const dotenv = require("dotenv");

// * ENV Variable(s)
dotenv.config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const expressRateLimit = require("express-rate-limit");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const xssClean = require("xss-clean");
const http = require("http");
const mongoose = require("mongoose");
const routes = require("./routes");

// * Expres
const app = express();

// * CORS
app.use(cors({ origin: "*" }));

// * API Limit
const limit = expressRateLimit({
  max: 1000,
  windowsMs: 60 * 60 * 1000,
  message: "Too many requests!",
  standartHeaders: true,
  legeacyHeaders: false,
});

app.use(express.json({ limit }));

// * Security
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(hpp());
app.use(xssClean());

// * Server
const server = http.createServer(app);

server.listen(process.env.PORT, () =>
  console.log(
    `Server is started to listen HTTP requests on PORT ${process.env.PORT}`
  )
);

// * Connection to the MongoDB
(async function () {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Connection to the MongoDB is successful.`);
  } catch (e) {
    console.error(`Connection to the MongoDB is failed: ${e}`);
  }
})();

// * API Route(s)
app.use("/api", routes);
