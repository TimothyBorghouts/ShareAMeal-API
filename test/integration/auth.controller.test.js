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

  //UC-101 Inloggen
  describe('UC-101 Inloggen', () => {
    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
      done();
    });

    it('TC-101-2 Niet-valide wachtwoord', (done) => {
      done();
    });

    it('TC-101-3 Gebruiker bestaat niet', (done) => {
      done();
    });

    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
      done();
    });
  });
});
