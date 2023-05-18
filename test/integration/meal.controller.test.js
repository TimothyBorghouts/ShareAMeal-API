const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

chai.should();
chai.use(chaiHttp);

//UC-301 - Toevoegen van maaltijd.
describe('UC-201 - Toevoegen van een gebruiker', () => {});

//UC-302 - Wijzigen van maaltijdgegevens.
describe('UC-202 - Bekijken van alle gebruikers', () => {});

//UC-303 - Opvragen van alle maaltijden.
describe('UC-203 - Het opvragen van een persoonlijk gebruikers profiel', () => {});

//UC-304 - Opvragen van maaltijd bij ID.
describe('UC-204 - Een specifieke gebruiker opvragen', () => {});

//UC-305 - Verwijderen van maaltijd.
describe('UC-205 - Verander een specifieke gebruiker', () => {});
