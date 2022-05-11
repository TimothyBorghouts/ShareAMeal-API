const asser = require("assert");
const pool = require("../../database/dbconnection");
let userDatabase = [];
let id = 0;

let controller = {
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password } = user;
    try {
      asser(typeof firstName === "String", "firstName must be a string");
      asser(typeof lastName === "String", "lastName must be a string");
      asser(typeof emailAdress === "String", "emailAdress must be a string");
      asser(typeof password === "String", "password must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
    next(err);
  },

  //201 - Toevoegen van een gebruiker aan de gebruiker database.
  addUser: (req, res) => {
    let user = req.body;
    id++;
    user = {
      id,
      ...user,
    };
    userDatabase.push(user);
    res.status(201).json({
      status: 201,
      result: userDatabase,
    });
  },

  //202 - Bekijken van alle gebruikers in de gebruiker database.
  getAllUsers: (req, res) => {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        "SELECT something FROM sometable",
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) throw error;

          // Don't use the connection here, it has been returned to the pool.
          console.log("result = ", results);
          res.status(200).json,
            {
              statusCode: 200,
              results: results,
            };

          // pool.end((err) => {
          //   console.log("pool was closed");
          // });
        }
      );
    });
  },

  //203 - Het opvragen van een persoonlijk gebruikers profiel
  getUserProfile: (req, res) => {
    res.status(203).json({
      status: 203,
      result: "Deze functionaliteit is nog niet gerealiseerd.",
    });
  },

  //204 - Een specifieke gebruiker opvragen uit de gebruiker database.
  getSpecificUser: (req, res, next) => {
    const userId = req.params.userId;
    let user = userDatabase.filter((item) => item.id == userId);
    if (user.length > 0) {
      console.log(user);
      res.status(204).json({
        status: 204,
        result: user,
      });
    } else {
      const error = {
        status: 404,
        result: "User with Id not found",
      };
      next(error);
    }
  },

  //205 - Verander een specifieke gebruiker uit de gebruiker database.
  changeUser: (req, res) => {
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

  //206 - Verwijder een gebruiker uit de gebruiker database
  deleteUser: (req, res) => {
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

module.exports.controller;
