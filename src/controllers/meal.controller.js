const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const { log } = require('console');
const logger = require('../config/config').logger;

let controller = {
  validateMealExistence: (req, res, next) => {
    logger.info('validateMealExistence called');

    const mealId = req.params.mealId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('SELECT * FROM meal WHERE id = ' + mealId, function (error, results, fields) {
        if (error) throw error;

        if (results.length <= 0) {
          logger.debug('Meal was not found with id ' + mealId + '.');
          connection.release();
          res.status(404).json({
            status: 404,
            message: 'Meal with Id: ' + mealId + ' does not exist',
            data: '',
          });
        } else {
          next();
        }
      });
    });
  },

  validateMealOwnership: (req, res, next) => {
    logger.info('validateMealOwnership called');

    let payloadUserId = req.userId;
    log(payloadUserId);
    const mealId = req.params.mealId;
    log(mealId);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('SELECT * FROM meal WHERE id = ?;', [mealId], function (error, results, fields) {
        if (error) throw error;
        log(results[0].cookId);
        connection.release();
        if (results[0].cookId == payloadUserId) {
          next();
        } else {
          res.status(403).json({
            status: 403,
            message: 'Unauthorized: You are not the owner of the data',
            data: '',
          });
        }
      });
    });
  },

  validateMealInput: (req, res, next) => {
    let meal = req.body;
    let { name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, maxAmountOfParticipants, price } = meal;

    try {
      assert(typeof name === 'string', 'Name must be a string');
      assert(typeof description === 'string', 'Description must be a string');
      assert(isActive != null, 'isActive is invalid');
      assert(isVega != null, 'isVega is invalid');
      assert(isVegan != null, 'isVegan is invalid');
      assert(isToTakeHome != null, 'isToTakeHome is invalid');
      assert(typeof dateTime === 'string', 'DateTime must be a string');
      assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
      assert(typeof price === 'number', 'Price must be a number');
      assert(typeof imageUrl === 'string', 'Image url must be a string');

      next();
    } catch (err) {
      logger.debug('Wrong meal input');
      const error = {
        status: 400,
        message: err.message,
        data: '',
      };
      next(error);
    }
  },

  //UC-301 - Toevoegen van maaltijd
  addMeal: (req, res, next) => {
    logger.info('addMeal called');

    let meal = req.body;
    allergenes = '';
    let cook = req.userId;
    let price = parseFloat(meal.price);
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        'INSERT INTO meal (`name`, `description`,`isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `allergenes`, `createDate`, `updateDate`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?);',
        [meal.name, meal.description, meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, price, meal.imageUrl, cook, allergenes, date, date],
        function (error, results, fields) {
          if (error) throw error;
          connection.query(`SELECT * FROM meal ORDER BY createDate DESC LIMIT 1;`, function (error, results, fields) {
            connection.release();

            meal = results[0];

            if (meal.isActive) {
              meal.isActive = true;
            } else {
              meal.isActive = false;
            }

            if (meal.isVega) {
              meal.isVega = true;
            } else {
              meal.isVega = false;
            }

            if (meal.isVegan) {
              meal.isVegan = true;
            } else {
              meal.isVegan = false;
            }

            if (meal.isToTakeHome) {
              meal.isToTakeHome = true;
            } else {
              meal.isToTakeHome = false;
            }

            logger.debug('Added meal to database.');
            res.status(201).json({
              status: 201,
              message: 'Meal succesfully added',
              data: meal,
            });
          });
        }
      );
    });
  },

  //UC-302 - Wijzigen van maaltijdgegevens
  updateMealById: (req, res) => {
    logger.info('updateMealById called');

    const mealId = req.params.mealId;
    logger.debug(mealId);
    let meal = req.body;
    logger.debug(meal);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, name = ?, description = ? WHERE id = ${mealId}`,
        [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.name, meal.description],
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          logger.debug('Updated meal with updateMealById.');
          res.status(200).json({
            status: 200,
            message: 'Meal succesfully updated',
            data: meal,
          });
        }
      );
    });
  },

  //UC-303 - Opvragen van alle maaltijden
  getAllMeals: (req, res) => {
    logger.info('getAllMeals called');

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(`SELECT * FROM meal;`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        logger.debug('Found all the meals with getAllMeals.');
        res.status(200).json({
          status: 200,
          results: results,
        });
      });
    });
  },

  //UC-304 - Opvragen van maaltijd bij ID
  getMealById: (req, res) => {
    logger.info('getMealById called');

    const mealId = req.params.mealId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(`SELECT * FROM meal WHERE id = ?`, [mealId], function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length == 0) {
          logger.debug('No user found with getMealById.');
          res.status(404).json({
            status: 404,
            message: 'Maaltijd met Id ' + mealId + ' bestaat niet',
          });
        } else {
          logger.debug('Found specific meal with getMealById.');

          meal = results[0];

          price = parseFloat(meal.price);
          if (meal.isActive == 1) {
            meal.isActive = true;
          } else {
            meal.isActive = false;
          }

          res.status(200).json({
            status: 200,
            message: 'Succesfully received profile',
            data: results[0],
          });
        }
      });
    });
  },

  //UC-305 - Verwijderen van maaltijd
  deleteMealById: (req, res) => {
    logger.info('deleteMealById called');

    const mealId = req.params.mealId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('DELETE FROM meal Where id = ?', [mealId], function (error, results, fields) {
        connection.release();
        if (error) throw error;

        logger.debug('Deleted meal with deleteMealById.');
        res.status(200).json({
          status: 200,
          message: 'Maaltijd is uit de database verwijderd',
        });
      });
    });
  },
};

module.exports = controller;
