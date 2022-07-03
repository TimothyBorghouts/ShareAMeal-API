require("dotenv").config();
const chai = require("chai");
const chaiHttps = require("chai-http");
const server = require("../../index");
const assert = require("assert");
const logger = require("../../../config/config").logger;
const dbconnection = require("../../src/database/dbconnection");
const jwt = require("jsonwebtoken");
const jwtSecretKey = require("../../../config/config");

chai.should();
chai.use(chaiHttps);

//Db queries to clear and fill the test database before each test.
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

//Voeg een user toe aan de database. Deze user heeft id 1.
//Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
const INSERT_USER =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

//Query om twee meals toe te voegen. Let op de cookId, die moet matchen
//met een bestaande user in de database.
const INSERT_MEALS =
  "INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES" +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

// UC-204 Get a single user by ID
describe("UC-204", () => {
  beforeEach((done) => {
    logger.debug("beforeEach called");
    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

      // Use the connection
      connection.query(
        CLEAR_DB + INSERT_USER + INSERT_MEALS,
        function (error, results, fields) {
          // When done with the connection, release it.
          connection.release();

          // Handle error after the release.
          if (error) next(err);
          // done() aanroepen nu je de query callback eindigt.
          logger.debug("beforeEach done");
          done();
        }
      );
    });

    chai
      .request(server)
      .post("/api/auth/login")
      .send({ emailAdress: "name@server.nl", password: "secret" })
      .end((err, res) => {
        logger.info(res.body);
      });
  });

  it("TC-204 get an user by id", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
      .end((err, res) => {
        let { status, result } = res.body;
        res.should.have.status(202);
        res.body.results.should.be.a("array").that.eqluals([
          {
            id: 1,
            firstName: "first",
            lastName: "last",
            isActive: 1,
            emailAdress: "name@server.nl",
            password: "secret",
            phoneNumber: "-",
            roles: "editor,guest",
            street: "street",
            city: "city",
          },
        ]);
        done();
      });
  });
});
