const assert = require("assert");
const jwt = require("jsonwebtoken");
const dbconnection = require("../../database/dbconnection");
const logger = require("../config/config").logger;
const jwtSecretKey = require("../config/config").jwtSecretKey;

const queryString = `SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?`;

let controller = {
  //User uses emaal and password to receive a token.
  login(req, res, next) {
    logger.info("login is called");

    dbconnection.getConnection((err, connection) => {
      if (err) {
        logger.error("No connection from dbconnection.");
        res.status(500).json({
          statusCode: 500,
          message: err.toString(),
        });
      }

      //dbconnection is succesfully connected
      if (connection) {
        logger.info("Database connected!");

        connection.query(
          queryString,
          [req.body.emailAdress],
          (err, rows, fields) => {
            connection.release();
            //User with that emailAdress does not exist.
            if (err) {
              connection.release();
              logger.debug("User does not exist");
              res.status(404).json({
                statusCode: 404,
                message: "User does not exist.",
              });
            }

            //Kijken of het paswoord bestaat en of er wel een password is ingevoerd.
            if (
              rows &&
              rows.length === 1 &&
              rows[0].password == req.body.password
            ) {
              logger.info("password is correct.");

              const user = rows[0];
              const { password, ...userinfo } = rows[0];

              //email en wachtwoord zijn correct dus we geven het token terug.
              jwt.sign(
                { userid: user.id },
                jwtSecretKey,
                { expiresIn: "30d" },
                function (err, token) {
                  logger.info(token);
                  res.status(200).json({
                    statusCode: 200,
                    result: { ...userinfo, token },
                  });
                }
              );

              //email en wachtwoord zijn incorrect dus we geven een error terug.
            } else {
              logger.debug("Email or password is incorrect or does not exist.");
              res.status(404).json({
                statusCode: 404,
                message: "Email or password is incorrect or does not exist.",
              });
            }
          }
        );

        //dbconnection is not connected
      } else {
        logger.info("No connection!");
      }
    });
  },

  validateLogin(req, res, next) {
    logger.info("ValidateLogin called");

    //Checkt of de email een string is.
    try {
      assert(
        typeof req.body.emailAdress === "string",
        "email must be a string."
      );

      //Checkt of het wachtwoord een string is.
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );

      //Regex die checkt of het emailaddress twee punten en een apenstaartje bevatten.
      assert.match(
        req.body.emailAdress,
        /.+\@.+\..+/,
        "This is not an correct email address."
      );

      //Regex die checkt of het wachtwoord 8 letters of getallen bevat.
      assert.match(
        req.body.password,
        /([0-9a-zA-Z]{8,})/,
        "This is not an correct password."
      );

      next();
    } catch (err) {
      res.status(400).json({
        statusCode: 400,
        message: err.toString(),
      });
    }
  },

  //Check if the token that the user uses is correct before performing other actions.
  validateToken(req, res, next) {
    logger.info("ValidateToken called");

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.error("no authorization header!");
      res.status(401).json({
        statusCode: "401",
        message: "No authorization header",
      });
    } else {
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.error("Not authorized");
          res.status(401).json({
            statusCode: 401,
            message: "Not authorized",
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.userid;
          logger.info("userId = ", payload.userid);
          next();
        }
      });
    }
  },
};

module.exports = controller;
