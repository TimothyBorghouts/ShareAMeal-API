const asser = require("assert");
const pool = require("../../database/dbconnection");
const dbconnection = require("../../database/dbconnection");

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let {
      firstName,
      lastName,
      isActive,
      emailAdress,
      password,
      phoneNumber,
      street,
      city,
    } = user;

    try {
      asser(typeof firstName === "string", "firstName must be a string");
      asser(typeof lastName === "string", "lastName must be a string");
      asser(typeof isActive === "number", "isActive must be a number");
      asser(typeof emailAdress === "string", "emailAdress must be a string");
      asser(typeof password === "string", "password must be a string");
      assert(typeof phoneNumber === "string", "phonenumber must be a string");
      assert(typeof street === "string", "street must be a string");
      assert(typeof city === "string", "city must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
  },

  //UC-201 - Toevoegen van een gebruiker aan de gebruiker database.
  addUser: (req, res) => {
    //Haal de ingevoerde gebruiker op.
    let user = req.body;
    console.log("Input = " + user);

    let userFirstName = user.firstname;
    let userLastName = user.lastname;
    let userisActive = user.isActive;
    let userEmailAdress = user.emailAdress;
    let userPassword = user.password;
    let userPhoneNumber = user.phonenumber;
    let userStreet = user.street;
    let userCity = user.city;

    //Maak verbinding met de database en voeg de gegeven gebruiker toe.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ('${userFirstName}', '${userLastName}', '${userisActive}', '${userEmailAdress}', '${userPassword}', '${userPhoneNumber}', '${userStreet}', '${userCity}');`,
        function (error, results, fields) {
          connection.release();
          if (err) throw err;
        }
      );
    });

    //Stuur de toegevoegde gebruiker terug.
    console.log("Result = " + results);
    res.status(201).json({
      status: 201,
      result: "Gebruiker is toegevoegt aan de database",
    });
  },

  //UC-202 - Bekijken van alle gebruikers in de gebruiker database.
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

  //UC-203 - Het opvragen van een persoonlijk gebruikers profiel
  getUserProfile: (req, res) => {
    //Stuur dat een persoonlijk profiel nog niet kan worden opgevraagt.
    console.log("Result = Deze functie is niet gerealiseerd");
    res.status(203).json({
      status: 203,
      result: "Deze functionaliteit is nog niet gerealiseerd.",
    });
  },

  //UC-204 - Een specifieke gebruiker opvragen uit de gebruiker database.
  getUserById: (req, res, next) => {
    //Haal de gegeven gebruiker id op.
    const userId = req.params.userId;
    console.log("Input = " + userId);

    //Maak verbinding met de database.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      //Haal de gebruiker met het id op.
      connection.query(
        `SELECT * FROM user Where id = ` + userId,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          //Check of de gebruiker met dat id wel bestaat en geeft een foutmelding zo niet.
          if (results.length === 0) {
            console.log("Result = De gebruiker is niet gevonden");
            return res.status(404).json({
              status: 404,
              result: "Gebruiker met Id " + userId + " bestaat niet",
            });
          } else {
            //Stuur de opgehaalde gebruiker terug.
            console.log("Result = " + results);
            res.status(204).json({
              status: 204,
              result: results,
            });
          }
        }
      );
    });
  },

  //UC-205 - Verander een specifieke gebruiker uit de gebruiker database.
  updateUserById: (req, res) => {
    //Haal de gegeven gebruiker id op.
    const userId = req.params.userId;
    console.log("Input = " + userId);
    let user = req.body;

    //Maak verbinding met de database.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      //Check of de gebruiker wel bestaat voor het verwijderen.
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          //Stuur dat de gebruiker niet bestaat binnen de database
          if (results.length === 0) {
            //Als de gebruiker niet bestaat wordt de connectie hier ook vroegtijdig afgebroken
            connection.release();
            return res.status(404).json({
              status: 404,
              result: "Gebruiker met Id " + userId + " bestaat niet",
            });
          } else {
            //Update de gebruiker in de database wanneer deze bestaat.
            let userFirstName = user.firstname;
            let userLastName = user.lastname;
            let userPhoneNumber = user.phonenumber;
            connection.query(
              `UPDATE user SET firstName = '${userFirstName}', lastName = '${userLastName}', isActive = '${user.isActive}', emailAdress = '${user.emailAdress}', password = '${user.password}', phoneNumber = '${userPhoneNumber}', street = '${user.street}', city = '${user.city}' WHERE id = ${userId}`,
              function (error, results, fields) {
                connection.release();
                if (error) throw error;

                //Stuur de geupdate gebruiker terug.
                console.log("Result = " + results);
                res.status(205).json({
                  status: 205,
                  result: "Gebruiker is aangepast",
                });
              }
            );
          }
        }
      );
    });
  },

  //UC-206 - Verwijder een gebruiker uit de gebruiker database
  deleteUserById: (req, res) => {
    //Haal de gegeven gebruiker id op.
    const userId = req.params.userId;
    console.log("Input = " + userId);

    //Maak verbinding met de database.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      //Check of de gebruiker wel bestaat voor het verwijderen.
      connection.query(
        "SELECT * FROM user Where id = " + userId,
        function (error, results, fields) {
          if (error) throw error;

          //Stuur dat de gebruiker niet bestaat binnen de database
          if (results.length === 0) {
            //Als de gebruiker niet bestaat wordt de connectie hier ook vroegtijdig afgebroken
            connection.release();
            return res.status(404).json({
              status: 404,
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
                res.status(206).json({
                  status: 206,
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
