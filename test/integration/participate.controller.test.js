process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const dbconnection = require('../../database/dbconnection');
const logger = require('../../src/config/config').logger;

chai.should();
chai.use(chaiHttp);

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY4ODQxNzk0NSwiZXhwIjoxNjkwNDkxNTQ1fQ.ZHgrMDTbkV5TgzBkzp2dSpw1sggkQrNyVnaKydk7zNo';

describe('Testing Participate', () => {
  before((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('DELETE FROM meal;', function (error, result, field) {
        connection.query('DELETE FROM user;', function (error, result, field) {
          connection.query('DELETE FROM meal_participants_user;', function (error, result, field) {
            connection.query(
              'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
                '(5, "Timothy", "Borghouts", "timothy.borghouts@gmail.com", "wachtwoord123", "Brugstraat", "Eindhoven");',
              function (error, result, field) {
                connection.query(
                  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
                    "(1, 'Gevulde koeken', 'Gevulde koeken zijn vrij prima', 'Geen afbeelding', '2022-04-09 09:37:10', 1, 10.00, 5);",
                  function (error, result, field) {
                    connection.query(
                      'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
                        "(2, 'Vegetarische plopkoek', 'plopkoeken zijn gewoon lekker', 'Geen afbeelding', '2022-04-09 09:37:10', 10, 20.00, 5);",
                      function (error, result, field) {
                        if (error) throw error;
                        connection.release();
                        done();
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
    logger.debug('before done');
  });

  //TC-401 Aanmelden voor maaltijd
  describe('TC-401 Toevoegen van maaltijd', () => {
    it('TC-401-1 Niet ingelogd', (done) => {
      chai
        .request(server)
        .post('/api/meal/1/participate')
        .end((err, res) => {
          res.body.status.should.be.equal(401);
          res.body.message.should.be.equal('No authorization header');
          done();
        });
    });

    it('TC-401-2 Maaltijd bestaat niet', (done) => {
      chai
        .request(server)
        .post('/api/meal/100/participate')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.body.status.should.be.equal(404);
          res.body.message.should.be.equal('Maaltijd met ID 100 bestaat niet');
          done();
        });
    });

    it('TC-401-3 Succesvol aangemeld', (done) => {
      chai
        .request(server)
        .post('/api/meal/1/participate')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.body.status.should.be.equal(409);
          res.should.be.an('object');
          done();
        });
    });

    it('TC-401-4 Maximumaantal aanmeldingen is bereikt', (done) => {
      chai
        .request(server)
        .post('/api/meal/1/participate')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.body.status.should.be.equal(409);
          done();
        });
    });
  });

  //UC-402 Afmelden voor maaltijd
  describe('UC-402 Afmelden voor maaltijd', () => {
    beforeEach((done) => {
      dbconnection.getConnection((err, connection) => {
        connection.query('INSERT INTO `meal_participants_user` VALUES (1,5);', (err, result) => {
          connection.release();
          done();
        });
      });
    });

    it('TC-402-1 Niet ingelogd', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1/participate')
        .end((err, res) => {
          res.body.status.should.be.equal(401);
          res.body.message.should.be.equal('No authorization header');
          done();
        });
    });

    it('TC-402-2 Maaltijd bestaat niet', (done) => {
      chai
        .request(server)
        .delete('/api/meal/100/participate')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.body.status.should.be.equal(404);
          res.body.message.should.be.equal('Maaltijd met ID 100 bestaat niet');
          done();
        });
    });

    it('TC-402-3 Aanmelding bestaat niet', (done) => {
      chai
        .request(server)
        .delete('/api/meal/2/participate')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.body.status.should.be.equal(404);
          res.body.message.should.be.equal('Aanmelding bestaat niet');
          done();
        });
    });

    it('TC-402-4 Succesvol afgemeld', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1/participate')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.body.status.should.be.equal(200);
          done();
        });
    });
  });
});
