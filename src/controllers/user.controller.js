const dbconnection = require('../../database/dbconnection');
const assert = require('assert');
const logger = require('../config/config').logger;
const jwtSecretKey = require('../config/config').jwtSecretKey;
const bcrypt = require('bcrypt');
const { log } = require('console');

let controller = {
  validateUserExistence: (req, res, next) => {
    logger.info('validateUserExistence called');

    const userId = req.params.userId;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('SELECT * FROM user WHERE id = ' + userId, function (error, results, fields) {
        if (error) throw error;

        if (results.length <= 0) {
          logger.debug('User was not found with id ' + userId + '.');
          connection.release();
          res.status(404).json({
            status: 404,
            message: 'User with Id: ' + userId + ' does not exist',
          });
        } else {
          next();
        }
      });
    });
  },

  validateUserOwnership: (req, res, next) => {
    logger.info('validateUserOwnership called');

    let payloadUserId = req.userId;
    let userIdToChange = req.params.userId;

    if (userIdToChange == payloadUserId) {
      next();
    } else {
      res.status(403).json({
        status: 403,
        message: 'Unauthorized: You are not the owner of the data',
      });
    }
  },

  validateUserInput: (req, res, next) => {
    logger.info('validateUser called');

    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    try {
      assert(typeof firstName === 'string', 'Firstname must be a string.');
      assert(typeof lastName === 'string', 'Lastname must be a string.');
      assert(typeof emailAdress === 'string', 'Emailaddress must be a string.');
      assert(typeof password === 'string', 'Password must be a string.');
      assert(typeof street === 'string', 'Street must be a string.');
      assert(typeof city === 'string', 'City must be a string.');

      //Regex die checkt of het emailaddress twee punten en een apenstaartje bevatten.
      assert.match(emailAdress, /^(?=.{1,64}@)[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/, 'The email address is incorrect.');
      //Regex die checkt of het wachtwoord 8 letters of getallen bevat.
      assert.match(password, /([0-9a-zA-Z]{8,})/, 'The password is too short.');

      next();
    } catch (err) {
      logger.debug('Wrong user input');
      const error = {
        status: 400,
        message: 'Wrong user input, fields are incorrect',
        data: err.message,
      };
      next(error);
    }
  },

  validatePhoneNumber: (req, res, next) => {
    logger.info('validatePhoneNumber called');

    let user = req.body;
    let { phoneNumber } = user;

    try {
      //Couldn't create regex by myself so I used this regex: https://stackoverflow.com/questions/17949757/regular-expression-for-dutch-phone-number
      assert.match(phoneNumber, /(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/, 'The phonenumber is incorrect.');

      next();
    } catch (err) {
      logger.error('The phonenumber was not correct.');

      const error = {
        status: 400,
        message: err.message,
      };
      next(error);
    }
  },

  //UC-201 - Toevoegen van een gebruiker.
  addUser: (req, res, next) => {
    logger.info('addUser called');

    let user = req.body;
    logger.debug(user);

    //Hash het wachtwoord zodat het niet meer herkenbaar is
    bcrypt.hash(user.password, 10, function (err, hash) {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          `INSERT INTO user (firstName, lastName, emailAdress, password, phoneNumber, street, city) VALUES(?,?,?,?,?,?,?);`,
          [user.firstName, user.lastName, user.emailAdress, hash, user.phoneNumber, user.street, user.city],
          function (err, results, fields) {
            if (err) {
              connection.release();
              logger.debug('Could not add user to database, email alreadt exists.');

              res.status(409).json({
                status: 409,
                message: 'User with email: ' + user.emailAdress + ' does already exist.',
              });
            } else {
              connection.query(`SELECT * FROM user WHERE emailAdress = '${user.emailAdress}'`, function (error, results, fields) {
                connection.release();

                if (error) throw error;

                user = results[0];
                if (user.isActive) {
                  user.isActive = true;
                } else {
                  user.isActive = false;
                }

                logger.debug('Added user to database with addUser.');
                res.status(201).json({
                  status: 201,
                  result: user,
                });
              });
            }
          }
        );
      });
    });
  },

  //UC-202 - Bekijken van alle gebruikers.
  getAllUsers: (req, res) => {
    logger.info('getAllUsers called');
    const { isActive, firstName } = req.query;
    logger.info('Query parameters: ' + isActive + ' ' + firstName);

    try {
      if (isActive == 'false') {
        isActive = 0;
      } else {
        isActive = 1;
      }
    } catch (err) {}

    if (isActive && firstName) {
      queryString = `SELECT * FROM user WHERE firstName = '${firstName}' AND isActive = '${isActive}';`;
    } else if (firstName) {
      queryString = `SELECT * FROM user WHERE firstName = '${firstName}';`;
    } else if (isActive) {
      queryString = `SELECT * FROM user WHERE isActive = ${isActive};`;
    } else {
      queryString = `SELECT * FROM user;`;
    }

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(queryString, function (error, results, fields) {
        connection.release();
        if (error) {
          res.status(404).json({
            status: 404,
            message: 'Could not find users.',
          });
        } else {
          logger.debug('Found all the users with getAllUsers.');
          res.status(200).json({
            status: 200,
            result: results,
          });
        }
      });
    });
  },

  //UC-203 - Het opvragen van een persoonlijk gebruikers profiel.
  getUserProfile: (req, res, next) => {
    logger.info('getUserProfile called');
    let userId = req.userId;

    logger.info('Profile retrieved with userId ' + userId);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('SELECT * FROM user WHERE id = ?;', [userId], function (error, result, fields) {
        connection.release();

        if (result.length < 1) {
          logger.info('No user with ' + userId + ' found');
          res.status(404).json({
            statusCode: 404,
            message: `No user with ${userId} found`,
          });
        } else {
          logger.info('User found with id ' + userId);
          let user = result;
          res.status(200).json({
            status: 200,
            result: result,
          });
        }
      });
    });
  },

  //UC-204 - Een specifieke gebruiker opvragen.
  getUserById: (req, res) => {
    logger.info('getUserById called');

    const userId = req.params.userId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT * FROM user WHERE id = ?`, [userId], function (error, results, fields) {
        connection.release();
        if (error) throw error;

        if (results.length > 0) {
          logger.debug('Found specific user with getUserById.');
          res.status(200).json({
            status: 200,
            result: results[0],
          });
        }
      });
    });
  },

  //UC-205 - Verander een specifieke gebruiker.
  updateUserById: (req, res) => {
    logger.info('updateUserById called');

    const userId = req.params.userId;
    let user = req.body;
    let { firstName, lastName, emailAdress, password, phonenumber, street, city } = user;
    bcrypt.hash(user.password, 10, function (err, hash) {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          `UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ? WHERE id = ${userId}`,
          [firstName, lastName, emailAdress, hash, street, city],
          function (error, results, fields) {
            connection.release();
            if (error) throw error;

            logger.debug('Updated user with updateUserById.');
            res.status(200).json({
              status: 200,
              result: user,
            });
          }
        );
      });
    });
  },

  //UC-206 - Verwijder een gebruiker.
  deleteUserById: (req, res) => {
    logger.info('deleteUserById called');

    const userId = req.params.userId;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query('DELETE FROM user WHERE id = ' + userId, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        logger.debug('Deleted user with deleteUserById.');
        res.status(200).json({
          status: 200,
          message: 'User is deleted.',
        });
      });
    });
  },
};

module.exports = controller;
