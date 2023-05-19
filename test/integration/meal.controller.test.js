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

describe('Testing Meal', () => {
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

  //UC-301 Toevoegen van maaltijd
  describe('UC-301 Toevoegen van maaltijd', () => {
    it('TC-301-1 Verplicht veld ontbreekt', (done) => {
      done();
    });

    it('TC-301-2 Niet ingelogd', (done) => {
      done();
    });

    it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
      done();
    });
  });

  //UC-302 Wijzigen van maaltijdsgegevens
  describe('UC-302 Wijzigen van maaltijdsgegevens', () => {
    it('TC-302-1 Verplicht velden name en/of price en/of maxAmountOfParticipants ontbreken', (done) => {
      done();
    });

    it('TC-302-2 Niet ingelogd', (done) => {
      done();
    });

    it('TC-302-3 Niet de eigenaar van de data', (done) => {
      done();
    });

    it('TC-302-4 Maaltijd bestaat niet', (done) => {
      done();
    });

    it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
      done();
    });
  });

  //UC-303 Opvragen van alle maaltijden
  describe('UC-303 Opvragen van alle maaltijden', () => {
    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
      done();
    });
  });

  //UC-304 Opvragen van maaltijd bij ID
  describe('UC-304 Opvragen van maaltijd bij ID', () => {
    it('TC-304-1 Maaltijd bestaat niet', (done) => {
      done();
    });

    it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
      done();
    });
  });

  //UC-305 Verwijderen van maaltijd
  describe('UC-305 Verwijderen van maaltijd', () => {
    it('TC-305-1 Niet ingelogd', (done) => {
      done();
    });

    it('TC-305-2 Niet de eigenaar van de data', (done) => {
      done();
    });

    it('TC-305-3 Maaltijd bestaat niet', (done) => {
      done();
    });

    it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
      done();
    });
  });
});
