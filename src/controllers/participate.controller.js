const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const { log } = require('console');
const logger = require('../config/config').logger;

let controller = {
  checkIfMealExists: (req, res, next) => {
    logger.info('checkIfMealExists called');
    const mealId = parseInt(req.params.mealId);

    dbconnection.getConnection((err, connection) => {
      if (err) {
        throw err;
      }
      connection.query('SELECT * FROM meal WHERE id = ?;', [mealId], (err, results, fields) => {
        connection.release();
        if (results.length !== 0) {
          next();
        } else {
          const err = {
            status: 404,
            message: 'Maaltijd met ID ' + mealId + ' bestaat niet',
          };
          next(err);
        }
      });
    });
  },

  checkIfParticipateExists: (req, res, next) => {
    logger.info('checkIfParticipateExists called');
    const mealId = parseInt(req.params.mealId);

    dbconnection.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM meal_participants_user WHERE mealId = ?;', [mealId], (err, results, fields) => {
        connection.release();
        if (results.length !== 0) {
          next();
        } else {
          const err = {
            status: 404,
            message: `Aanmelding bestaat niet`,
          };
          next(err);
        }
      });
    });
  },

  //UC-401 Aanmelden voor maaltijd
  participateToMeal: (req, res) => {
    logger.info('participateToMeal called');

    let userId = req.userId;
    const mealId = req.params.mealId;

    dbconnection.getConnection((err, connection) => {
      connection.query('INSERT INTO meal_participants_user (mealId, userId) VALUES(?, ?);', [mealId, userId], (error, results, fields) => {
        if (error) {
          connection.release();
          logger.debug('Could not add participant to meal');

          res.status(409).json({
            status: 409,
            message: 'Error when adding participant to meal' + err,
          });
        } else {
          res.status(200).json({
            status: 200,
            message: 'succesvol aangemeld',
          });
        }
      });
    });
  },

  //UC-402 Afmelden voor maaltijd
  participateLeaveMeal: (req, res) => {
    logger.info('participateLeaveMeal called');

    let userId = req.userId;
    const mealId = req.params.mealId;

    dbconnection.getConnection((err, connection) => {
      connection.query('DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?;', [mealId, userId], (error, results, fields) => {
        connection.release();
        res.status(200).json({
          status: 200,
          result: 'succesvol afgemeld',
        });
      });
    });
  },

  //UC-403 Opvragen van deelnemers
  getAllParticipants: (req, res) => {
    logger.info('getAllParticipants called');

    const mealId = parseInt(req.params.mealId);

    dbconnection.getConnection((err, connection) => {
      connection.query('SELECT * FROM meal_participants_user WHERE mealId = ?;', [mealId], (error, results, fields) => {
        connection.release();
        res.status(200).json({
          status: 200,
          result: results,
        });
      });
    });
  },

  //UC-404 Opvragen van details van deelnemer
  getParticipantsDetails: (req, res) => {
    logger.info('getParticipantsDetails called');

    const userId = req.params.userId;
    const mealId = req.params.mealId;

    dbconnection.getConnection((err, connection) => {
      connection.query('SELECT * FROM meal_participants_user WHERE mealId = ?;', [mealId], (error, result, fields) => {
        if (result.length > 0 && userId == result[0].userId) {
          connection.query('SELECT * FROM user WHERE id = ?;', [userId], (err, result, fields) => {
            if (err) throw err;
            connection.release();
            res.status(200).json({
              status: 200,
              result: result,
            });
          });
        } else {
          connection.release();
          res.status(404).json({
            status: 404,
            result: 'Participant not found.',
          });
        }
      });
    });
  },
};

module.exports = controller;
