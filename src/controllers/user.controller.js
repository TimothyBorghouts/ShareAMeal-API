const dbconnection = require("../../database/dbconnection");
const assert = require("assert");
const logger = require("../config/config").logger;

let controller = {
  validateUser: (req, res, next) => {
    logger.info("validateUser called");

    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    try {
      assert(typeof firstName === "string", "Firstname must be a string.");
      assert(typeof lastName === "string", "Lastname must be a string.");
      assert(typeof emailAdress === "string", "Emailaddress must be a string.");
      assert(typeof password === "string", "Password must be a string.");
      assert(typeof street === "string", "Street must be a string.");
      assert(typeof city === "string", "City must be a string.");
      //Regex die checkt of het emailaddress twee punten en een apenstaartje bevatten.
      assert.match(
        emailAdress,
        /.+\@.+\..+/,
        "The email address is incorrect."
      );
      //Regex die checkt of het wachtwoord 8 letters of getallen bevat.
      assert.match(password, /([0-9a-zA-Z]{8,})/, "The password is to short.");

      next();
    } catch (err) {
      logger.debug("Wrong user input");
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  validatePhoneNumber: (req, res, next) => {
    logger.info("validatePhoneNumber called");

    let user = req.body;
    let { phoneNumber } = user;

    try {
      //Couldn't create regex by myself so I used this regex: https://stackoverflow.com/questions/17949757/regular-expression-for-dutch-phone-number
      assert.match(
        phoneNumber,
        /(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/,
        "The phonenumber is incorrect."
      );

      next();
    } catch (err) {
      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  //UC-201 - Toevoegen van een gebruiker.
  addUser: (req, res, next) => {
    logger.info("addUser called");

    let user = req.body;
    logger.debug(user);
    let {
      firstName,
      lastName,
      emailAdress,
      password,
      phoneNumber,
      street,
      city,
    } = user;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);`,
        [firstName, lastName, emailAdress, password, phoneNumber, street, city],
        function (err, results, fields) {
          if (err) {
            connection.release();
            logger.debug(
              "Could not add user to database, email alreadt exists."
            );

            res.status(409).json({
              status: 409,
              message:
                "User with email: " + emailAdress + " does already exist.",
            });
          } else {
            connection.query(
              `SELECT * FROM user WHERE emailAdress = '${user.emailAdress}'`,
              function (error, results, fields) {
                connection.release();

                if (error) throw error;

                user = results[0];
                if (user.isActive) {
                  user.isActive = true;
                } else {
                  user.isActive = false;
                }

                logger.debug("Added user to database with addUser.");
                res.status(201).json({
                  status: 201,
                  result: user,
                });
              }
            );
          }
        }
      );
    });
  },

  //UC-202 - Bekijken van alle gebruikers.
  getAllUsers: (req, res) => {
    logger.info("getAllUsers called");

    // let input = req.input;
    // const firstName = input.firstName;
    // const isActive = input.isActive;

    //Als er geen isActive en geen firstName is gegeven.
    let query = `SELECT * FROM user`;

    //Als er geen isActive maar wel firstName is gegeven.
    // if (isActive != undefined && firstName == undefined) {
    //   query = `SELECT * FROM user WHERE isActive = ${isActive}`;
    //   //
    //   //Als er wel isActive maar geen firstName is gegeven.
    // } else if (isActive == undefined && firstName != undefined) {
    //   query = `SELECT * FROM user WHERE firstName = ${firstName}`;
    //   //
    //   //Als er isActive en firstName is gegeven.
    // } else {
    //   query = `SELECT * FROM user WHERE firstName = ${firstName} AND WHERE isActive = ${isActive}`;
    // }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(query, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        logger.debug("Found all the users with getAllUsers.");
        res.status(200).json({
          statusCode: 200,
          results: results,
        });
      });
    });
  },

  //UC-203 - Het opvragen van een persoonlijk gebruikers profiel.
  getUserProfile: (req, res) => {
    logger.info("getUserProfile called");

    const userId = req.userId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM user WHERE id = ?`,
        [userId],
        function (error, results, fields) {
          connection.release();

          logger.debug("Found a user with getUserProfile.");
          res.status(200).json({
            status: 200,
            result: results[0],
          });
        }
      );
    });
  },

  //UC-204 - Een specifieke gebruiker opvragen.
  getUserById: (req, res) => {
    logger.info("getUserById called");

    const userId = req.params.userId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `SELECT * FROM user Where id = ?`,
        [userId],
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          if (results.length > 0) {
            logger.debug("Found specific user with getUserById.");
            res.status(200).json({
              status: 200,
              result: results[0],
            });
          } else {
            logger.debug("No user found with getUserById.");
            res.status(404).json({
              status: 404,
              message: "User with Id: " + userId + " does not exist",
            });
          }
        }
      );
    });
  },

  //UC-205 - Verander een specifieke gebruiker.
  updateUserById: (req, res) => {
    logger.info("updateUserById called");

    const userId = req.params.userId;
    let user = req.body;
    let {
      firstName,
      lastName,
      emailAdress,
      password,
      phonenumber,
      street,
      city,
    } = user;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          if (results.length > 0) {
            connection.query(
              `UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ? WHERE id = ${userId}`,
              [firstName, lastName, emailAdress, password, street, city],
              function (error, results, fields) {
                connection.release();
                if (error) throw error;

                logger.debug("Updated user with updateUserById.");
                res.status(200).json({
                  status: 200,
                  result: user,
                });
              }
            );
          } else {
            logger.debug("User was not found with updateUserById.");
            connection.release();
            res.status(400).json({
              status: 400,
              message: "User with Id: " + userId + " does not exist",
            });
          }
        }
      );
    });
  },

  //UC-206 - Verwijder een gebruiker.
  deleteUserById: (req, res) => {
    logger.info("deleteUserById called");

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

                logger.debug("Deleted user with deleteUserById.");
                res.status(200).json({
                  status: 200,
                  message: "User is deleted.",
                });
              }
            );
          } else {
            logger.debug("User was not found with deleteUserById.");
            connection.release();
            res.status(400).json({
              status: 400,
              message: "User does not exist",
            });
          }
        }
      );
    });
  },
};

module.exports = controller;
