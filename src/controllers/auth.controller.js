const dbconnection = require("../../database/dbconnection");
const jwt = require("jsonwebtoken");
const assert = require("assert");
const logger = require("../config/config").logger;
const jwtSecretKey = require("../config/config").jwtSecretKey;

const controller = {
  login: (req, res, next) => {
    //Assert voor validatie
    const { emailAdress, password } = req.body;
    console.log("");

    const queryString = `SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?`;
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        next(err);
      }

      connection.query(
        queryString,
        [emailAdress],
        function (error, results, fields) {
          connection.release();

          if (error) throw error;

          if (results && results.length === 1) {
            //er was een user met dit emailadres.
            //check of het password klopt.
            console.log(results);

            const user = results[0];
            if (user.password === password) {
              //email en password zijn correct dus we geven het token.
              jwt.sign(
                { userid: user.id },
                "process.env.JWT_SECRET",
                { expiresIn: "7d" },
                function (err, token) {
                  if (err) console.log(err);
                  if (token) {
                    console.log(token);
                    res.status(200).json({
                      statusCode: 200,
                      results: token,
                    });
                  }
                }
              );
            } else {
            }
          } else {
            // Er was geen user gevonden
            console.log("user not found");
            res.status(404).json({
              statusCode: 404,
              message: "email not found",
            });
          }
        }
      );
    });
  },

  validateLogin(req, res, next) {
    // Verify that we receive the expected input
    try {
      assert(
        typeof req.body.emailAdress === "string",
        "email must be a string."
      );
      assert(
        typeof req.body.password === "string",
        "password must be a string."
      );
      next();
    } catch (error) {
      res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
  },

  validateToken(req, res, next) {
    logger.info("validateToken called");
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn("Authorization header missing!");
      res.status(401).json({
        error: "Authorization header missing!",
        datetime: new Date().toISOString(),
      });
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length);

      jwt.verify(token, jwtSecretKey, (err, payload) => {
        if (err) {
          logger.warn("Not authorized");
          res.status(401).json({
            error: "Not authorized",
            datetime: new Date().toISOString(),
          });
        }
        if (payload) {
          logger.debug("token is valid", payload);
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.userId;
          next();
        }
      });
    }
  },
};

module.exports = controller;
