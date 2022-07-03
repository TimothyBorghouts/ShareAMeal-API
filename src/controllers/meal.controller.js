const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
const logger = require("../config/config").logger;

let controller = {
  validateMeal: (req, res, next) => {
    let meal = req.body;
    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      imageUrl,
      price,
    } = meal;

    try {
      assert(typeof name === "string", "Name must be a string");
      assert(typeof description === "string", "Description must be a string!");
      assert(isActive != null, "isActive is invalid");
      assert(isVega != null, "isVega is invalid");
      assert(isVegan != null, "isVegan is invalid");
      assert(isToTakeHome != null, "isToTakeHome is invalid");
      assert(typeof dateTime === "string", "DateTime must be a string");
      assert(typeof imageUrl === "string", "Image url must be a string");
      assert(typeof price === "number", "Price must be a number");

      next();
    } catch (err) {
      logger.debug("Wrong meal input");
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  //UC-301 - Toevoegen van een maaltijd.
  addMeal: (req, res, next) => {
    logger.info("addMeal called");

    let meal = req.body;
    logger.debug(meal);
    let {
      name,
      description,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      cookId,
      imageUrl,
      maxAmountOfParticipants,
      price,
    } = meal;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO meal ( isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES(?,?,?,?,?,?,?,?,?,?,?);`,
        [
          isActive,
          isVega,
          isVegan,
          isToTakeHome,
          dateTime,
          maxAmountOfParticipants,
          price,
          imageUrl,
          cookId,
          name,
          description,
        ],
        function (err, results, fields) {
          if (err) {
            connection.release();
            logger.debug("Could not add meal to database.");

            res.status(409).json({
              status: 409,
              message: "Meal could not be added to database",
            });
          } else {
            connection.query(
              `SELECT * FROM meal WHERE name = '${meal.name}'`,
              function (error, results, fields) {
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

                if (error) throw error;

                logger.debug("Added meal to database with addUser.");
                res.status(201).json({
                  status: 201,
                  result: meal,
                });
              }
            );
          }
        }
      );
    });
  },

  //UC-302 - Bekijken van alle maaltijden.
  getAllMeals: (req, res) => {
    logger.info("getAllMeals called");

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT * FROM meal`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        logger.debug("Found all the meals with getAllMeals.");
        res.status(200).json({
          statusCode: 200,
          results: results,
        });
      });
    });
  },

  //UC-303 - Een specifieke maaltijd opvragen.
  getMealById: (req, res) => {
    logger.info("getMealById called");

    const mealId = req.params.mealId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM meal Where id = ?`,
        [mealId],
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          if (results.length > 0) {
            logger.debug("Found specific meal with getMealById.");
            res.status(200).json({
              status: 200,
              result: results[0],
            });
          } else {
            logger.debug("No user found with getMealById.");
            res.status(404).json({
              status: 404,
              result: "Maaltijd met Id " + mealId + " bestaat niet",
            });
          }
        }
      );
    });
  },

  //UC-304 - Verander een specifieke maaltijd.
  updateMealById: (req, res) => {
    logger.info("updateMealById called");

    const mealId = req.params.userId;
    let meal = req.body;
    let {
      name,
      description,
      price,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      imageUrl,
      dateTime,
    } = meal;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          if (results.length > 0) {
            connection.query(
              `UPDATE meal SET firstName = ?, lastName = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE id = ${mealId}`,
              function (error, results, fields) {
                connection.release();
                if (error) throw error;

                logger.debug("Updated meal with updateMealById.");
                res.status(200).json({
                  status: 200,
                  result: meal,
                });
              }
            );
          } else {
            logger.debug("Meal was not found with updateMealById.");
            connection.release();
            return res.status(404).json({
              status: 404,
              result: "Maaltijd met Id " + mealId + " bestaat niet",
            });
          }
        }
      );
    });
  },

  //UC-305 - Verwijder een maaltijd.
  deleteMealById: (req, res) => {
    logger.info("deleteMealById called");

    const userId = req.params.userId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          if (results.length > 0) {
            connection.query(
              "DELETE FROM user Where id = " + userId,
              function (error, results, fields) {
                connection.release();
                if (error) throw error;

                logger.debug("Deleted meal with deleteMealById.");
                res.status(200).json({
                  status: 200,
                  result: "Maaltijd is uit de database verwijderd",
                });
              }
            );
          } else {
            logger.debug("Meal was not found with deleteMealById.");
            connection.release();
            res.status(400).json({
              status: 400,
              result: "Maaltijd met Id " + mealId + " bestaat niet",
            });
          }
        }
      );
    });
  },
};

module.exports = controller;
