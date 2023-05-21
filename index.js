require('dotenv').config();
const express = require('express');
const app = express();

const port = process.env.PORT;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');
const mealRoutes = require('./src/routes/meal.routes');
const participateRoutes = require('./src/routes/participate.routes');

const logger = require('./src/config/config').logger;

//Logs the request from the user.
app.all('*', (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is aangeroepen`);
  next();
});

// All specific routes.
app.use(userRoutes);
app.use(authRoutes);
app.use(mealRoutes);
app.use(participateRoutes);

// Gives error that route doesn't exist.
app.all('*', (req, res) => {
  res.status(401).json({
    status: 401,
    result: 'End-point not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.debug('Error handler called.');
  res.status(err.status).json(err);
});

// Messages when server opens
app.listen(port, () => {
  logger.debug('Server started on port ' + port);
});

process.on('SIGINT', () => {
  logger.debug('SIGINT signal received: closing HTTP server');
  dbconnection.end((err) => {
    logger.debug('Database connection closed');
  });
  //Messages when server closes
  app.close(() => {
    logger.debug('Server closed');
  });
});

module.exports = app;
