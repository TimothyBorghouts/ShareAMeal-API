const asser = require("assert");
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
    res.status(202).json({
      status: 202,
      result: userDatabase,
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
  deleteUser:
    (req,
    (res) => {
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
    }),
};

modeule.exports.controller;
