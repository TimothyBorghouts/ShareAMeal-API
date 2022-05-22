const dbconnection = require("../../database/dbconnection");
const asser = require("assert");

let controller = {
  //UC-301 - Toevoegen van een maaltijd.
  addMeal: (req, res) => {
    let meal = req.body;
    let {
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      dateTime,
      maxAmountOfParticipants,
      price,
      imageUrl,
      cookId,
      createDate,
      updateDate,
      name,
      description,
      allergenes,
    } = meal;

    //Maak verbinding met de database en voeg de gegeven gebruiker toe.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO user ( isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes,) VALUES(?,?,?,?,?,?);`,
        [
          isActive,
          isVega,
          isVegan,
          isToTakeHome,
          dateTime,
          maxAmountOfParticipants,
          price,
          imageUrl,
          cookId,
          createDate,
          updateDate,
          name,
          description,
          allergenes,
        ],
        function (error, results, fields) {
          connection.release();
          if (err) throw err;

          //Stuur de toegevoegde maaltijd terug.
          console.log("Result = " + results);
          res.status(301).json({
            status: 301,
            result: "Maaltijd is toegevoegt aan de database",
          });
        }
      );
    });
  },

  //UC-302 - Bekijken van alle maaltijden.
  getAllMeals: (req, res) => {
    //Maak verbinding met de database en haal alle maaltijden op.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(`SELECT * FROM meal`, function (error, results, fields) {
        connection.release();
        if (error) throw error;

        //Stuur alle opgehaalde maaltijden terug.
        console.log("Result = " + results);
        res.status(302).json({
          statusCode: 302,
          results: results,
        });
      });
    });
  },

  //UC-303 - Een specifieke maaltijd opvragen.
  getMealById: (req, res, next) => {
    const mealId = req.params.mealId;
    console.log("Input = " + mealId);

    //Maak verbinding met de database.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      //Haal de maaltijd met het id op.
      connection.query(
        `SELECT * FROM meal Where id = ` + mealId,
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          //Check of de maaltijd met dat id wel bestaat en geeft een foutmelding zo niet.
          if (results.length === 0) {
            console.log("Result = De gebruiker is niet gevonden");
            return res.status(404).json({
              status: 404,
              result: "Gebruiker met Id " + userId + " bestaat niet",
            });
          } else {
            //Stuur de opgehaalde maaltijd terug.
            console.log("Result = " + results);
            res.status(303).json({
              status: 303,
              result: results,
            });
          }
        }
      );
    });
  },

  //UC-304 - Verander een specifieke maaltijd.
  updateMealById: (req, res) => {
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

  //UC-305 - Verwijder een maaltijd.
  deleteMealById: (req, res) => {
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
