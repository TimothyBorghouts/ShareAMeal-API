const dbconnection = require("../../database/dbconnection");
const assert = require("assert");

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    try {
      assert(typeof firstName === "string", "Firstname must be a string.");
      assert(typeof lastName === "string", "Lastname must be a string.");
      assert(typeof emailAdress === "string", "Emailaddress must be a string.");
      assert(typeof password === "string", "Password must be a string.");
      assert(typeof street === "string", "Street must be a string.");
      assert(typeof city === "string", "City must be a string.");

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
    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES(?,?,?,?,?,?);`,
        [firstName, lastName, emailAdress, password, street, city],
        function (error, results, fields) {
          if (error) {
            connection.release();
            res.status(409).json({
              status: 409,
              message:
                "Gebruiker met emailaddress " + emailAdress + " bestaat al.",
            });
          } else {
            connection.release();
            console.log("Result = " + user);
            res.status(201).json({
              status: 201,
              result: user,
            });
          }
        }
      );
    });
  },

  //UC-202 - Bekijken van alle gebruikers.
  getAllUsers: (req, res) => {
    //Maak verbinding met de database en haal alle gebruikers op.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT * FROM user`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        //Stuur alle opgehaalde gebruikers terug.
        console.log("Result = " + results);
        res.status(202).json({
          statusCode: 202,
          results: results,
        });
      });
    });
  },

  //UC-203 - Het opvragen van een persoonlijk gebruikers profiel.
  getUserProfile: (req, res) => {
    //Stuur dat een persoonlijk profiel nog niet kan worden opgevraagt.
    console.log("Result = Deze functie is niet gerealiseerd");
    res.status(203).json({
      status: 203,
      result: "Deze functionaliteit is nog niet gerealiseerd.",
    });
  },

  //UC-204 - Een specifieke gebruiker opvragen.
  getUserById: (req, res) => {
    //Haal de gegeven gebruiker id op.
    const userId = req.params.userId;
    console.log("Input = " + userId);
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      //Haal de gebruiker met het id op.
      connection.query(
        `SELECT * FROM user Where id = ?`,
        [userId],
        function (error, results, fields) {
          connection.release();

          if (results.length > 0) {
            res.status(200).json({
              status: 200,
              result: results[0],
            });
          } else {
            res.status(404).json({
              status: 404,
              message: "User with Id " + userId + " not found.",
            });
          }
        }
      );
    });
  },

  //UC-205 - Verander een specifieke gebruiker.
  updateUserById: (req, res) => {
    //Haal de gegeven gebruiker id op.
    const userId = req.params.userId;
    console.log("Input = " + userId);
    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      //Check of de gebruiker wel bestaat voor het verwijderen.
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          //Stuur dat de gebruiker niet bestaat binnen de database
          if (results.length == 0) {
            //Als de gebruiker niet bestaat wordt de connectie hier ook vroegtijdig afgebroken
            connection.release();
            return res.status(400).json({
              status: 400,
              message: "Gebruiker met Id " + userId + " bestaat niet",
            });
          } else {
            //Update de gebruiker in de database wanneer deze bestaat.
            connection.query(
              `UPDATE user SET firstName = ?, lastName = ?, emailAdress = ?, password = ?, street = ?, city = ? WHERE id = ${userId}`,
              [firstName, lastName, emailAdress, password, street, city],
              function (error, results, fields) {
                connection.release();
                if (error) throw error;

                //Stuur de geupdate gebruiker terug.
                console.log("Result = " + results);
                res.status(200).json({
                  status: 200,
                  result: user,
                });
              }
            );
          }
        }
      );
    });
  },

  //UC-206 - Verwijder een gebruiker.
  deleteUserById: (req, res) => {
    //Haal de gegeven gebruiker id op.
    const userId = req.params.userId;
    console.log("Input = " + userId);

    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      //Check of de gebruiker wel bestaat voor het verwijderen.
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          //Stuur dat de gebruiker niet bestaat binnen de database
          if (results.length == 0) {
            //Als de gebruiker niet bestaat wordt de connectie hier ook vroegtijdig afgebroken
            connection.release();
            return res.status(400).json({
              status: 400,
              result: "Gebruiker met Id " + userId + " bestaat niet",
            });
          } else {
            //Verwijder de gebruiker uit de database als deze gebruiker bestaat.
            connection.query(
              "DELETE FROM user Where id = " + userId,
              function (error, results, fields) {
                connection.release();
                if (error) throw error;

                //Stuur alle gebruikers waar de verwijderde niet meer in staat.
                console.log("Result = gebruiker is uit de database verwijderd");
                res.status(200).json({
                  status: 200,
                  result: "Gebuiker is uit de database verwijderd",
                });
              }
            );
          }
        }
      );
    });
  },
};

module.exports = controller;
