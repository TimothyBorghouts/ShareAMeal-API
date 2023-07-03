process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareameal';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const dbconnection = require('../../database/dbconnection');
const logger = require('../../src/config/config').logger;


chai.should();
chai.use(chaiHttp);

//Tokens die even nodig is om mee te kunnen testen. Éen is correct en de ander incorrect.
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY4ODQxNzk0NSwiZXhwIjoxNjkwNDkxNTQ1fQ.ZHgrMDTbkV5TgzBkzp2dSpw1sggkQrNyVnaKydk7zNo';

describe('Testing Meal', () => {
  before((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;
      connection.query('DELETE FROM meal;', function (error, result, field) {
        connection.query('DELETE FROM user;', function (error, result, field) {
          connection.query(
            'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
              '(5, "Timothy", "Borghouts", "timothy.borghouts@gmail.com", "wachtwoord123", "Brugstraat", "Eindhoven");',
            function (error, result, field) {
              connection.query(
                'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
                  "(1, 'Vegetarische plopkoek', 'plopkoeken zijn gewoon lekker', 'Geen afbeelding', '2022-04-09 09:37:10', 10, 20.00, 5);",
                function (error, result, field) {
                  if (error) throw error;
                  connection.release();
                  done();
                }
              );
            }
          );
        });
      });
    });
    logger.debug('before done');
  });

  //TC-301 Toevoegen van maaltijd
  describe('TC-301 Toevoegen van maaltijd', () => {
    //Er ontbreekt een verplicht veld waardoor de maaltijd niet kan worden toegevoegt
    it('TC-301-1 Verplicht veld ontbreekt', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Vegetarische pizza',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
          cookId: 5,
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('Description must be a string');
          done();
        });
    });

    //De gebruiket is niet ingelogd en mag daarom geen maaltijd toevoegen
    it('TC-301-2 Niet ingelogd', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .send({
          name: 'Vegetarische pizza',
          description: 'De beste vegetarische pizza van de wereld',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //Maaltijd is succesvol toegevoegd en wordt geretourneerd
    it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .send({
          name: 'Vegetarische pizza',
          description: 'De beste vegetarische pizza van de wereld',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
          cookId: 5,
        })
        .end((err, res) => {
          res.should.have.status(401);
          res.should.be.an('object');
          done();
        });
    });
  });

  //UC-302 Wijzigen van maaltijdsgegevens
  describe('UC-302 Wijzigen van maaltijdsgegevens', () => {
    //Verplichte melden prijs of deelnemers missen waardoor de maaltijd niet kan worden gewijzigd
    it('TC-302-1 Verplicht velden name en/of price en/of maxAmountOfParticipants ontbreken', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Vegetarische pizza',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('Description must be a string');
          done();
        });
    });

    //De gebruiker is niet ingelogd en mag daarom geen maaltijden wijzigen
    it('TC-302-2 Niet ingelogd', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .send({
          name: 'Vegetarische pizza',
          description: 'De beste vegetarische pizza van de wereld',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //De gebruiker is neit eigenaar van de maaltijd en mag daarom de maaltijd niet wijzigen
    it('TC-302-3 Niet de eigenaar van de data', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Vegetarische pizza',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a('string').that.equals('Description must be a string');
          done();
        });
    });

    //De maaltijd bestaat niet en kan dus niet worden gewijzigd
    it('TC-302-4 Maaltijd bestaat niet', (done) => {
      chai
        .request(server)
        .put('/api/meal/300')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Vegetarische pizza',
          description: 'De beste vegetarische pizza van de wereld',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a('string').that.equals('Maaltijd met Id bestaat niet');
          done();
        });
    });

    //Maaltijd is succesvol gewijzigd en wordt geretourneerd
    it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .auth(token, { type: 'bearer' })
        .send({
          name: 'Vegetarische pizza',
          description: 'De beste vegetarische pizza van de wereld',
          isActive: 1,
          isVega: 0,
          isVegan: 1,
          isToTakeHome: 1,
          dateTime: '2022-03-26T20:24:46.000Z',
          maxAmountOfParticipants: 2,
          price: 12.0,
          imageUrl: 'https://www.kikkoman.nl/fileadmin/_processed_/5/7/csm_WEB_Bonte_groenteschotel_6851203953.jpg',
          allergenes: ['noten'],
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an('object');
          let { result } = res.body;
          result.should.has.property('name').to.be.equal('Vegetarische pizza');
          done();
        });
    });
  });

  //UC-303 Opvragen van alle maaltijden
  describe('UC-303 Opvragen van alle maaltijden', () => {
    //Alle maaltijd worden opgevraagd en geretourneerd
    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
      chai
        .request(server)
        .get('/api/meal')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equals(200);
          done();
        });
    });
  });

  //UC-304 Opvragen van maaltijd bij ID
  describe('UC-304 Opvragen van maaltijd bij ID', () => {
    //Maaltijd bestaat niet en kan dus niet worden geretourneerd
    it('TC-304-1 Maaltijd bestaat niet', (done) => {
      chai
        .request(server)
        .get('/api/meal/100')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a('string').that.equals('Maaltijd met Id 100 bestaat niet');
          done();
        });
    });

    //Maaltijd met ID is gevonden en wordt geretourneerd
    it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
      chai
        .request(server)
        .get('/api/meal/1')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          res.should.be.an('object');
          let { status } = res.body;
          status.should.equals(200);
          done();
        });
    });
  });

  //UC-305 Verwijderen van maaltijd
  describe('UC-305 Verwijderen van maaltijd', () => {
    //De gebruiker is niet ingelogd en mag daarom de maaltijd niet verwijderen
    it('TC-305-1 Niet ingelogd', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //De gebruiker is niet de eigenaar van de maaltijd en mag daarom de maaltijd niet verwijderen
    it('TC-305-2 Niet de eigenaar van de data', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1')
        .end((err, res) => {
          res.should.be.an('object');
          let { status, message } = res.body;
          message.should.be.a('string').that.equals('No authorization header');
          done();
        });
    });

    //De maaltijd bestaat niet en kan daarom niet worden verwijderd
    it('TC-305-3 Maaltijd bestaat niet', (done) => {
      chai
        .request(server)
        .delete('/api/meal/200')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          console.log(err);
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be.a('string').that.equals('Maaltijd met Id 200 bestaat niet');
          done();
        });
    });

    //Maaltijd is succesvol verwijderd
    it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1')
        .auth(token, { type: 'bearer' })
        .end((err, res) => {
          console.log(err);
          res.should.be.an('object');
          let { status, message } = res.body;
          status.should.equals(200);
          message.should.be.a('string').that.equals('Maaltijd is uit de database verwijderd');
          done();
        });
    });
  });
});
