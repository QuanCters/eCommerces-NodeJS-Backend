require("dotenv").config();
const compression = require("compression");
const express = require("express");
const { default: helmet } = require("helmet"); // avoid attack using --include
const morgan = require("morgan"); // morgan will print log after each request
const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
); // no need to use body parser

// init database
require("./dbs/init.mongodb");

// init routes
app.use("/", require("./routes/index"));

// handle error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
