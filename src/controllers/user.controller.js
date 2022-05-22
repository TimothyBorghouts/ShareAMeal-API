const dbconnection = require("../../database/dbconnection");
const asser = require("assert");

let controller = {
  // validateUser: (req, res, next) => {
  //   let user = req.body;
  //   let {
  //     firstName,
  //     lastName,
  //     isActive,
  //     emailAdress,
  //     password,
  //     phoneNumber,
  //     street,
  //     city,
  //   } = user;

  //   try {
  //     asser(typeof firstName === "string", "firstName must be a string");
  //     asser(typeof lastName === "string", "lastName must be a string");
  //     asser(typeof isActive === "number", "isActive must be a number");
  //     asser(typeof emailAdress === "string", "emailAdress must be a string");
  //     asser(typeof password === "string", "password must be a string");
  //     assert(typeof phoneNumber === "string", "phonenumber must be a string");
  //     assert(typeof street === "string", "street must be a string");
  //     assert(typeof city === "string", "city must be a string");
  //     next();
  //   } catch (err) {
  //     const error = {
  //       status: 400,
  //       result: err.message,
  //     };
  //     next(error);
  //   }
  // },

  //UC-201 - Toevoegen van een gebruiker.
  addUser: (req, res) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password, street, city } = user;

    //Maak verbinding met de database en voeg de gegeven gebruiker toe.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        `INSERT INTO user (firstName, lastName, emailAdress, password, street, city) VALUES(?,?,?,?,?,?);`,
        [firstName, lastName, emailAdress, password, street, city],
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          console.log("Result = " + user);
          res.status(201).json({
            status: 201,
            result: user,
          });
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
              result: "User with Id " + userId + " not found.",
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
              result: "Gebruiker met Id " + userId + " bestaat niet",
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
