const express = require("express");
const app = express();

require("dotenv").config();
const port = process.env.PORT;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const mealRoutes = require("./src/routes/meal.routes");

//Logs the request from the user.
app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`\nMethod ${method} is aangeroepen`);
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
  res.status(err.status).json(err);
});

//Logs the start of the server.
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
