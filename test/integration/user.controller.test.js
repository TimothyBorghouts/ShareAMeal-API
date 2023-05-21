process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const dbconnection = require('../../database/dbconnection');

const logger = require('../../src/config/config').logger;

const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../../src/config/config').jwtSecretKey;

chai.should();
chai.use(chaiHttp);

//Tokens die even nodig is om mee te kunnen testen. Éen is correct en de ander incorrect.
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYwLCJpYXQiOjE2ODQ0MDQ1NTEsImV4cCI6MTY4NjQ3ODE1MX0.xVplH8-s09lcOmlouqQvI2LThBWSOPRF1bH4pKnfVJc';
const incorrectToken = 'dyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYwLCJpYXQiOjE2ODQ0MDQ1NTEsImV4cCI6MTY4NjQ3ODE1MX0.xVplH8-s09lcOmlouqQvI2LThBWSOPRF1bH4pKnfVJc';

describe('Testing User', () => {
  before((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('DELETE FROM `meal`;', function (error, results, fields) {
        connection.query('DELETE FROM `user`;', function (error, results, fields) {
          if (error) throw error;
          connection.release();
          done();
        });
      });
    });
    logger.info('Before done');
  });

  //TC-201 Registreren als nieuwe user
  describe('TC-201 Registreren als nieuwe user', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [1, 'Bob', 'Bouwer', 'Hofplein', 'Rotterdam', 1, 'bob.bouwer@gmail.com', 'bouwen123', '0691291244'],
              (error, result, field) => {
                connection.release();
                done();
              }
            );
          });
        });
      });
    });

    //Achternaam ontbreekt en daarvoor wordt een foutmelding gestuurd.
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'Timothy',
          street: 'HoofdStraat',
          city: 'Eindhoven',
          phoneNumber: '0612345678',
          password: 'abdcefg1234',
          emailAdress: 'timothy.borghouts@gmail.com',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an('object');
          let { message } = res.body;
          message.should.be.a('string').that.contains('string');
          done();
        });
    });

    //Email address is niet valide en daarvoor wordt een foutmelding gestuurd.
    it('TC-201-2 Niet-valide emailadres', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'Timothy',
          lastName: 'Borghouts',
          street: 'HoofdStraat',
          city: 'Eindhoven',
          phoneNumber: '0612345678',
          password: 'abdcefg1234',
          emailAdress: 'TimothyHeefteenDikkeneus@Neus',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an('object');
          let { message } = res.body;
          message.should.be.a('string').that.contains('incorrect');
          done();
        });
    });

    //Wachtwoord is niet valide en daarvoor wordt een foutmelding gestuurd.
    it('TC-201-3 Niet-valide wachtwoord', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'Timothy',
          lastName: 'Borghouts',
          street: 'HoofdStraat',
          city: 'Eindhoven',
          phoneNumber: '0612345678',
          password: 'lol',
          emailAdress: 'timothy.borghouts@gmail.com',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(400);
          res.should.be.an('object');
          let { message } = res.body;
          message.should.be.a('string').that.contains('password');
          done();
        });
    });

    //gebruiker bestaat al en daarvoor wordt een foutmelding gestuurd.
    it('TC-201-4 Gebruiker bestaat al', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'Bob',
          lastName: 'Bouwer',
          street: 'Hofplein',
          city: 'Rotterdam',
          phoneNumber: '0612345678',
          password: 'bouwen123',
          emailAdress: 'bob.bouwer@gmail.com',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(409);
          res.should.be.an('object');
          let { message } = res.body;
          message.should.be.a('string').that.contains('does already exist');
          done();
        });
    });

    //Gebruiker wordt succesvol geregistreerd en naar de user gestuurd
    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          firstName: 'Timothy',
          lastName: 'Borghouts',
          street: 'HoofdStraat',
          city: 'Eindhoven',
          phoneNumber: '0612345678',
          password: 'abdcefg1234',
          emailAdress: 'timothy.borghouts@gmail.com',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(201);
          res.should.be.an('object');
          let { result } = res.body;
          result.should.has.property('firstName').to.be.equal('Timothy');
          done();
        });
    });
  });

  //UC-202 Opvragen van overzicht van users
  describe('TC-202 Opvragen van overzicht van users', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [4, 'Timothy', 'Borghouts', 'HoofdStraat', 'Breda', 1, 'timothy.bouwer@gmail.com', 'brouwer456', '06812392244'],
              (error, result, field) => {
                connection.query(
                  'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
                  [5, 'Justin', 'Siep', 'Hofplein', 'Rotterdam', 0, 'justin.bouwer@gmail.com', 'brouwer456', '06812392244'],
                  (error, result, field) => {
                    connection.release();
                    done();
                  }
                );
              }
            );
          });
        });
      });
    });

    //Alle gebruikers worden opgevraagt en als array geretourneerd
    it('TC-202-1 Toon alle gebruikers', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an('array').that.lengthOf(2);
          done();
        });
    });

    //Gebruiker wordt gezocht met niet bestaande zoekterm en stuurt alle gebruikers terug
    it('TC-202-2 Toon gebruikers met zoekterm op niet bestaande velden', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an('array').that.lengthOf(2);
          done();
        });
    });

    //Gebruikers worden gezocht die actief zijn en worden gestuurt
    it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld isActive=false', (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=false')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an('array').that.lengthOf(1);
          done();
        });
    });

    //Gebruikers worden gezocht die inactief zijn en worden gestuurt
    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld isActive=true', (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=true')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an('array').that.lengthOf(1);
          done();
        });
    });

    //Gebruikers worden gezocht die Timothy hebben als voornaam en worden gestuurt
    it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=Timothy')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an('array').that.lengthOf(1);
          done();
        });
    });
  });

  //UC-203 Opvragen van gebruikersprofiel
  describe('TC-203 Opvragen van gebruikersprofiel', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [1, 'Timothy', 'Borghouts', 'Langhoofd', 'Breda', 1, 'timothy.borghouts@gmail.com', 'jajaja', '0691291244'],
              (error, result, field) => {
                connection.release();
                done();
              }
            );
          });
        });
      });
    });

    //Token is niet valide en daarvoor wordt een foutmelding gestuurd
    it('TC-203-1 Ongeldig token', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .auth(incorrectToken, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.a('string').that.contains('Not authorized');
          done();
        });
    });

    //Token is valide en gebruikersprofiel wordt opgehaald
    it('TC-203-2 Gebruiker is ingelogd met geldig token', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=Timothy')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          result.should.be.an('array').that.lengthOf(1);
          done();
        });
    });
  });

  //UC-204 Opvragen van usergegevens bij ID
  describe('TC-204 Opvragen van usergegevens bij ID', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [1, 'Timothy', 'Borghouts', 'Langhoofd', 'Breda', 1, 'timothy.borghouts@gmail.com', 'jajaja', '0691291244'],
              (error, result, field) => {
                connection.release();
                done();
              }
            );
          });
        });
      });
    });

    //Token is niet valide en daarvoor wordt een foutmelding gestuurd
    it('TC-204-1 Ongeldig token', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .auth(incorrectToken, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be.a('string').that.contains('Not authorized');
          done();
        });
    });

    //Gebruiker met ID bestaat niet en daarvoor wordt een foutmelding gestuurd
    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
      chai
        .request(server)
        .get('/api/user/101')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a('string').that.contains('does not exist');
          done();
        });
    });

    //Er is een gebruiker gevonden met het ID en die wordt opgehaald
    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .auth(token, { type: 'bearer' })
        .send({})
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          done();
        });
    });
  });

  //UC-205 Updaten van usergegevens
  describe('TC-205 Updaten van usergegevens', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [1, 'Timothy', 'Borghouts', 'HoofdStraat', 'Breda', 1, 'timothy.bouwer@gmail.com', 'brouwer456', '06812392244'],
              (error, result, field) => {
                connection.query(
                  'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
                  [2, 'Justin', 'Siep', 'Hofplein', 'Rotterdam', 0, 'justin.bouwer@gmail.com', 'brouwer456', '06812392244'],
                  (error, result, field) => {
                    connection.release();
                    done();
                  }
                );
              }
            );
          });
        });
      });
    });

    //Er wordt geen emailAdress met de update meegegeven en daarvoor wordt een foutmelding gestuurd
    it('TC-205-1 Verplicht veld emailAddress ontbreekt', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .auth(token, { type: 'bearer' })
        .send({
          firstName: 'Timotijger',
          lastName: 'Spaans',
          street: 'Langhoofd',
          city: 'Eindhoven',
          password: 'jajaja123',
          phoneNumber: '06912384758',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('Emailaddress must be a string.');
          done();
        });
    });

    //De gebruiker is niet dezelfde gebruiker die die aan het bewerken is
    it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .auth(token, { type: 'bearer' })
        .send({
          firstName: 'Timotijger',
          lastName: 'Spaans',
          street: 'Langhoofd',
          city: 'Eindhoven',
          password: 'jajaja123',
          phoneNumber: '06912384758',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('Emailaddress must be a string.');
          done();
        });
    });

    //Er wordt geen valide telefoonnummer met de update meegegeven en daarvoor wordt een foutmelding gestuurd
    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .auth(token, { type: 'bearer' })
        .send({
          firstName: 'Timotijger',
          lastName: 'Spaans',
          street: 'Langhoofd',
          city: 'Eindhoven',
          emailAdress: 'Timothy.borghouts@gmail.com',
          password: 'jajaja123',
          phoneNumber: '06',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('The phonenumber is incorrect.');
          done();
        });
    });

    //De gebruiker die bewerkt wordt bestaat niet en daarvoor wordt een foutmelding gestuurd
    it('TC-205-4 Gebruiker bestaat niet', (done) => {
      chai
        .request(server)
        .put('/api/user/101')
        .auth(token, { type: 'bearer' })
        .send({
          firstName: 'Timotijger',
          lastName: 'Spaans',
          street: 'Langhoofd',
          city: 'Eindhoven',
          emailAdress: 'Timothy.borghouts@gmail.com',
          password: 'jajaja123',
          phoneNumber: '0612748594',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a('string').that.equals('User with Id: 101 does not exist');
          done();
        });
    });

    //De gebruiker is niet ingelogd en mag daarom geen gegevens updaten
    it('TC-205-5 Niet ingelogd', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .send({
          firstName: 'Timotijger',
          lastName: 'Spaans',
          street: 'Langhoofd',
          city: 'Eindhoven',
          emailAdress: 'Timothy.borghouts@gmail.com',
          password: 'jajaja123',
          phoneNumber: '0612748594',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //De gebruikersgegevens zijn succesvol gewijzigd en worden opgehaald
    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .auth(token, { type: 'bearer' })
        .send({
          firstName: 'Timotijger',
          lastName: 'Spaans',
          street: 'Langhoofd',
          city: 'Eindhoven',
          emailAdress: 'Timothy.borghouts@gmail.com',
          password: 'jajaja123',
          phoneNumber: '0612748594',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an('object');
          let { result } = res.body;
          result.should.has.property('firstName').to.be.equal('Timotijger');
          done();
        });
    });
  });

  //UC-206 Verwijderenvan user
  describe('TC-206 Verwijderen van user', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [1, 'Timothy', 'Borghouts', 'Langhoofd', 'Breda', 1, 'timothy.borghouts@gmail.com', 'jajaja', '0691291244'],
              (error, result, field) => {
                connection.release();
                done();
              }
            );
          });
        });
      });
    });

    //De gebruiker die verwijderd wordt bestaat niet
    it('TC-206-1 Gebruiker bestaat niet', (done) => {
      chai
        .request(server)
        .delete('/api/user/101')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('User does not exist');
          done();
        });
    });

    //De gebruiker die wil verwijderen is niet ingelogd
    it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //De gebruiker verwijderd een andere gebruiker wat niet kan
    it('TC-206-3 De gebruiker is niet de eigenaar van de data', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //De gerbuiker is succesvol verwijderd
    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(200);
          message.should.be.a('string').that.equals('User is deleted.');
          done();
        });
    });
  });
});
