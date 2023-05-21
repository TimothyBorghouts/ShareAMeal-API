process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const logger = require('../../src/config/config').logger;

chai.should();
chai.use(chaiHttp);

describe('Testing Auth', () => {
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

  //TC-101 Inloggen
  describe('TC-101 Inloggen', () => {
    beforeEach((done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query('DELETE FROM user;', (error, result, field) => {
          connection.query('ALTER TABLE user AUTO_INCREMENT = 1;', (error, result, field) => {
            connection.query(
              'INSERT INTO user (id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
              [1, 'Timothy', 'Borghouts', 'Langhoofd', 'Breda', 1, 'timothy.borghouts@gmail.com', 'jajaja123', '0691291244'],
              (error, result, field) => {
                connection.release();
                done();
              }
            );
          });
        });
      });
    });

    //Verplicht veld ontbreekt om mee in te loggen
    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          emailAdress: 'timothy.borghouts@gmail.com',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.contains('password must be a string.');
          done();
        });
    });

    //Wachtwoord klopt niet met wachtwoord van de gebruiker
    it('TC-101-2 Niet-valide wachtwoord', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          emailAdress: 'timothy.borghouts@gmail.com',
          password: 'jajaja321',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.contains('Email or password is incorrect');
          done();
        });
    });

    //Gebruiker bestaat niet en kan niet inloggen
    it.skip('TC-101-3 Gebruiker bestaat niet', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          emailAdress: 'bob.isgrappig@gmail.com',
          password: 'jajaja123',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.contains('Email or password is incorrect');
          done();
        });
    });

    //Gebruiker is succesvol ingelogd en wordt opgehaald met nieuw token
    it.skip('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({
          emailAdress: 'timothy.borghouts@gmail.com',
          password: 'jajaja123',
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an('object');
          let { result } = res.body;
          result.should.has.property('firstName').to.be.equal('Timothy');
          result.should.has.property('token');
          done();
        });
    });
  });
});
