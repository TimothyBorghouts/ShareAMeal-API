const express = require("express");
const app = express();

const port = process.env.PORT;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const mealRoutes = require("./src/routes/meal.routes");
const logger = require("./src/config/config").logger;
require("dotenv").config();

//Logs the request from the user.
app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`\nMethod ${method} is aangeroepen`);
  next();
});

// All specific routes.
app.use(authRoutes);
app.use(userRoutes);
app.use(mealRoutes);

// Gives error that route doesn't exist.
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.debug("Error handler called.");
  res.status(500).json({
    statusCode: 500,
    message: err.toString(),
  });
});

// Messages when server opens
app.listen(port, () => {
  logger.debug("Server started");
});

process.on("SIGINT", () => {
  logger.debug("SIGINT signal received: closing HTTP server");
  dbconnection.end((err) => {
    logger.debug("Database connection closed");
  });
  //Messages when server closes
  app.close(() => {
    logger.debug("Server closed");
  });
});

module.exports = app;
