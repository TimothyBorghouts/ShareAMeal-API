const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const logger = require('../config/config').logger;
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../config/config').jwtSecretKey;
const bcrypt = require('bcrypt');

let controller = {
  //UC-101 - Inloggen
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

        connection.query('SELECT * FROM `user` WHERE `emailAdress` = ?', [req.body.emailAdress], (err, rows, fields) => {
          connection.release();
          //User with that emailAdress does not exist.
          if (err) {
            connection.release();
            logger.debug('User does not exist');
            res.status(404).json({
              status: 404,
              message: 'User does not exist.',
              data: '',
            });
          }

          //Kijken of het wachtwoord bestaat en of er wel een wachtwoord is ingevoerd.
          if (rows.length > 0) {
            //Kijken of de het wachtwoord klopt met bcrypt
            bcrypt.compare(req.body.password, rows[0].password, function (err, result) {
              if (result == true) {
                logger.info('password is correct.');

                const { password, ...userinfo } = rows[0];

                if (userinfo.isActive) {
                  userinfo.isActive = true;
                } else {
                  userinfo.isActive = false;
                }

                payload = {
                  userId: userinfo.id,
                };

                //email en wachtwoord zijn correct dus we geven het token terug.
                jwt.sign(payload, jwtSecretKey, { expiresIn: '24d' }, function (err, token) {
                  logger.info('User succesfully logged in: ' + token);
                  res.status(200).json({
                    status: 200,
                    message: 'Succesfully logged in',
                    data: { ...userinfo, token },
                  });
                });
                //email en wachtwoord zijn incorrect dus we geven een error terug.
              } else {
                logger.debug('Email or password is incorrect or does not exist.');
                res.status(400).json({
                  status: 400,
                  message: 'Email or password is incorrect or does not exist.',
                  data: '',
                });
              }
            });
          } else {
            logger.debug('No user found');
            res.status(404).json({
              status: 404,
              message: 'This user does not exist in the database',
              data: '',
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

    logger.info(req.body.emailAdress);
    logger.info(req.body.password);

    try {
      assert(typeof req.body.emailAdress === 'string', 'string email must be a string.');
      assert(typeof req.body.password === 'string', 'password must be a string.');
      assert.match(req.body.emailAdress, /^(?=.{1,64}@)[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/, 'This is not an correct email address.');
      assert.match(req.body.password, /([0-9a-zA-Z]{8,})/, 'This is not an correct password.');

      next();
    } catch (err) {
      logger.info('emailAdress or password was incorrect');
      res.status(400).json({
        status: 400,
        message: err.toString(),
        data: '',
      });
    }
  },

  //Check if the token that the user uses is correct before performing other actions.
  validateToken(req, res, next) {
    logger.info('ValidateToken called');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.error('no authorization header');
      res.status(401).json({
        status: 401,
        message: 'No authorization header',
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);
      logger.debug(token);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.error('Not authorized');
          res.status(401).json({
            status: 401,
            message: 'Not authorized',
          });
        }
        if (payload) {
          logger.info('token is valid', payload);
          // User heeft toegang. Voeg UserId uit payload toe aan request, voor ieder volgend endpoint.
          req.userId = payload.userId;
          logger.info('userId = ', payload.userId);
          next();
        }
      });
    }
  },

  //UC-102 - Opvragen van systeeminformatie
  info(req, res, next) {
    logger.info('Get server information');
    res.status(200).json({
      status: 200,
      message: 'Share a Meal API',
      data: {
        studentName: 'Timothy Borghouts',
        studentNumber: 2182610,
        description: 'Dit is de Share a Meal API van Timothy Borghouts',
      },
    });
  },
};

module.exports = controller;
