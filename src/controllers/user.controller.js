const asser = require("assert");
const pool = require("../../database/dbconnection");
const dbconnection = require("../../database/dbconnection");

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let {
      id,
      firstName,
      lastName,
      isActive,
      emailAdress,
      password,
      phoneNumber,
      roles,
      street,
      city,
    } = user;
    try {
      asser(typeof firstName === "string", "firstName must be a string");
      asser(typeof lastName === "string", "lastName must be a string");
      asser(typeof isActive === "number", "isActive must be a number");
      asser(typeof emailAdress === "string", "emailAdress must be a string");
      asser(typeof password === "string", "password must be a string");
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
    let user = req.body;
    console.log(user);

    //Maak verbinding met de database en voeg de gegeven gebruiker toe.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        1,
        "Mariëtte",
        "van den Dullemen",
        1,
        "m.vandullemen@server.nl",
        "secret",
        "",
        "",
        "",
        "",
        function (error, results, fields) {
          connection.release();
          if (err) throw err;
        }
      );
    });

    //Stuur de toegevoegde gebruiker terug.
    res.status(201).json({
      status: 201,
      result: results,
    });
  },

  //UC-202 - Bekijken van alle gebruikers in de gebruiker database.
  getAllUsers: (req, res) => {
    //Maak verbinding met de database en haal alle gebruikers op.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query("SELECT * FROM user", function (error, results, fields) {
        connection.release();
        if (error) throw error;

        //Stuur alle opgehaalde gebruikers terug.
        console.log("result =" + results);
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
    res.status(203).json({
      status: 203,
      result: "Deze functionaliteit is nog niet gerealiseerd.",
    });
  },

  //UC-204 - Een specifieke gebruiker opvragen uit de gebruiker database.
  getUserById: (req, res, next) => {
    //Verkrijg de gevraagde id
    const userId = req.params.userId;

    //Maak verbinding met de database en haal de gebruiker met het id op
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        "SELECT * FROM user Where id=1",
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          //Stuur de opgehaalde gebruiker terug.
          console.log("result =" + results);
          res.status(204).json({
            status: 204,
            result: results,
          });
        }
      );
    });
  },

  //UC-205 - Verander een specifieke gebruiker uit de gebruiker database.
  updateUserById: (req, res) => {
    const userId = req.params.userId;
    let user = userDatabase.filter((item) => item.id == userId);
    if (user.length > 0) {
      const index = userDatabase.indexOf(user);
      userDatabase.slice(index, 1);

      let user = req.body;
      user = {
        id,
        ...user,
      };
      userDatabase.push(user);

      res.status(205).json({
        status: 205,
        result: "Gebruiker is gewijzigd in de database" + userDatabase,
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
  },

  //UC-206 - Verwijder een gebruiker uit de gebruiker database
  deleteUserById: (req, res) => {
    const userId = req.params.userId;
    let user = userDatabase.filter((item) => item.id == userId);
    if (user.length > 0) {
      //Verwijderen uit de database.
      const index = userDatabase.indexOf(user);
      userDatabase.slice(index, 1);
      id--;

      res.status(206).json({
        status: 206,
        result: "Gebruiker is verwijderd uit de database",
      });
    } else {
      res.status(401).json({
        status: 401,
        result: `User with ID ${userId} not found`,
      });
    }
  },
};

module.exports = controller;
