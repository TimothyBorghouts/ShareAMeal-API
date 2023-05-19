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

  //UC-201 Registreren als nieuwe user
  describe('UC-201 Registreren als nieuwe user', () => {
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
      done();
    });

    it('TC-201-2 Niet-valide emailadres', (done) => {
      done();
    });

    it('TC-201-3 Niet-valide wachtwoord', (done) => {
      done();
    });

    it('TC-201-4 Gebruiker bestaat al', (done) => {
      done();
    });

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
      done();
    });
  });

  //UC-202 Opvragen van overzicht van users
  describe('UC-202 Opvragen van overzicht van users', () => {
    it('TC-202-1 Toon alle gebruikers', (done) => {
      done();
    });

    it('TC-202-2 Toon gebruikers met zoekterm op niet bestaande velden', (done) => {
      done();
    });

    it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld isActive=false', (done) => {
      done();
    });

    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld isActive=true', (done) => {
      done();
    });

    it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden', (done) => {
      done();
    });
  });

  //UC-203 Opvragen van gebruikersprofiel
  describe('UC-203 Opvragen van gebruikersprofiel', () => {
    it('TC-203-1 Ongeldig token', (done) => {
      done();
    });

    it('TC-203-2 Gebruiker is ingelogd met geldig token', (done) => {
      done();
    });
  });

  //UC-204 Opvragen van usergegevens bij ID
  describe('UC-204 Opvragen van usergegevens bij ID', () => {
    it('TC-204-1 Ongeldig token', (done) => {
      done();
    });

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
      done();
    });

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
      done();
    });
  });

  //UC-205 Updaten van usergegevens
  describe('UC-205 Updaten van usergegevens', () => {
    it('TC-205-1 Verplicht veld emailAddress ontbreekt', (done) => {
      done();
    });

    it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
      done();
    });

    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
      done();
    });

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
      done();
    });

    it('TC-205-5 Niet ingelogd', (done) => {
      done();
    });

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
      done();
    });
  });

  //UC-206 Verwijderenvan user
  describe('UC-206 Verwijderen van user', () => {
    it('TC-206-1 Gebruiker bestaat niet', (done) => {
      done();
    });

    it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
      done();
    });

    it('TC-206-3 De gebruiker is niet de eigenaar van de data', (done) => {
      done();
    });

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
      done();
    });
  });
});
