const dbconnection = require("../../database/dbconnection");
const asser = require("assert");

const controller = {
  login: (req, res, next) => {
    //Assert voor validatie
    const { emailAdress, password } = req.body;
    console.log("");

    const queryString = `SELECT id, firstName, lastName, emailAdress, password FROM user WHERE emailAdress = ?`;

    //Maak verbinding met de database en haal alle gebruikers op.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query(
        queryString,
        [emailAdres],
        function (error, results, fields) {
          connection.release();
          if (error) throw error;

          if (results && results.length === 1) {
            //er was een user met dit emailadres.
            //check of het password klopt.
            console.log(results);

            const user = results[0];
            if (user.password === password) {
              //email en password zijn correct.
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
            }
          } else {
            // Er was geen user gevonden
            console.log("user not found");
            res.status(404).json({
              statusCode: 404,
              results: "email not found",
            });
          }

          // //Stuur alle opgehaalde gebruikers terug.
          // console.log("Result = " + results);
          // res.status(200).json({
          //   statusCode: 200,
          //   results: results,
          // });
        }
      );
    });
  },
};

module.exports = controller;
