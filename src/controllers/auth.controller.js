const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const jwt = require('jsonwebtoken');
const logger = require('../config/config').logger;
const jwtSecretKey = require('../config/config').jwtSecretKey;

const queryString = 'SELECT * FROM `user` WHERE `emailAdress` = ?';

let controller = {
  //UC-101 - Inloggen als gebruiker met email en wachtwoord.
  login(req, res, next) {
    logger.info('login is called');

    dbconnection.getConnection((err, connection) => {
      if (err) {
        logger.error('No connection from dbconnection.');
        res.status(500).json({
          status: 500,
          message: err.toString(),
        });
      }

      //dbconnection is succesfully connected
      if (connection) {
        logger.info('Succesfully connected to database');

        connection.query(queryString, [req.body.emailAdress], (err, rows, fields) => {
          connection.release();
          //User with that emailAdress does not exist.
          if (err) {
            connection.release();
            logger.debug('User does not exist');
            res.status(404).json({
              status: 404,
              message: 'User does not exist.',
            });
          }

          //Kijken of het paswoord bestaat en of er wel een password is ingevoerd.
          if (rows && rows.length === 1 && rows[0].password == req.body.password) {
            logger.info('password is correct.');
            user = rows[0];

            if (user.isActive) {
              user.isActive = true;
            } else {
              user.isActive = false;
            }

            const { password, ...userinfo } = rows[0];
            const payload = {
              userId: userinfo.id,
            };

            //email en wachtwoord zijn correct dus we geven het token terug.
            jwt.sign(payload, jwtSecretKey, { expiresIn: '10d' }, function (err, token) {
              logger.info('User succesfully logged in: ' + token);
              res.status(200).json({
                status: 200,
                result: { ...userinfo, token },
              });
            });

            //email en wachtwoord zijn incorrect dus we geven een error terug.
          } else {
            logger.debug('Email or password is incorrect or does not exist.');
            res.status(404).json({
              status: 404,
              message: 'Email or password is incorrect or does not exist.',
            });
          }
        });

        //dbconnection is not connected
      } else {
        logger.info('No connection with database.');
      }
    });
  },

  //Ckeck of de inloggegevens correct zijn.
  validateLogin(req, res, next) {
    logger.info('ValidateLogin called');

    try {
      assert(typeof req.body.emailAdress === 'string email must be a string.');
      assert(typeof req.body.password === 'string', 'password must be a string.');
      assert.match(req.body.emailAdress, /.+\@.+\..+/, 'This is not an correct email address.');
      assert.match(req.body.password, /([0-9a-zA-Z]{8,})/, 'This is not an correct password.');

      next();
    } catch (err) {
      logger.info('emailAdress or password was incorrect');
      res.status(400).json({
        status: 400,
        message: err.toString(),
      });
    }
  },

  //Check if the token that the user uses is correct before performing other actions.
  validateToken(req, res, next) {
    logger.info('ValidateToken called');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.error('no authorization header!');
      res.status(401).json({
        status: '401',
        message: 'No authorization header',
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.error('Not authorized');
          res.status(401).json({
            status: 401,
            message: 'Not authorized',
          });
        }
        if (payload) {
          logger.debug('token is valid', payload);
          // User heeft toegang. Voeg UserId uit payload toe aan request, voor ieder volgend endpoint.
          req.userId = payload.userid;
          logger.info('userId = ', payload.userid);
          next();
        }
      });
    }
  },
};

module.exports = controller;
