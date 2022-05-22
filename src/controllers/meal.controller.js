const dbconnection = require("../../database/dbconnection");
const assert = require("assert");
const logger = require("../config/config").logger;

let controller = {
  validateMeal: (req, res, next) => {
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

    try {
      assert(typeof name === "string", "Name must be a string");
      assert(typeof description === "string", "Description must be a string!");
      assert(typeof price === "number", "Price must be a number");
      assert(isActive != null, "isActive is invalid");
      assert(isVega != null, "isVega is invalid");
      assert(isVegan != null, "isVegan is invalid");
      assert(isToTakeHome != null, "isToTakeHome is invalid");
      assert(typeof imageUrl === "string", "Image url must be a string");
      assert(typeof dateTime === "string", "DateTime must be a string");

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
  addMeal: (req, res) => {
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
        `INSERT INTO user ( name, description, price, isActive, isVega, isVegan, isToTakeHome, imageUrl, dateTime) VALUES(?,?,?,?,?,?,?,?,?);`,
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
          createDate,
          updateDate,
          name,
          description,
          allergenes,
        ],
        function (error, results, fields) {
          connection.release();
          if (err) throw err;

          logger.debug("Added meal to database with addMeal.");
          res.status(301).json({
            status: 301,
            result: "Maaltijd is toegevoegt aan de database",
          });
        }
      );
    });
  },

  //UC-302 - Bekijken van alle maaltijden.
  getAllMeals: (req, res) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT * FROM meal`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        logger.debug("Found all the meals with getAllMeals.");
        res.status(302).json({
          statusCode: 302,
          results: results,
        });
      });
    });
  },

  //UC-303 - Een specifieke maaltijd opvragen.
  getMealById: (req, res) => {
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
            res.status(303).json({
              status: 303,
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
                res.status(304).json({
                  status: 304,
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
                res.status(305).json({
                  status: 305,
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
