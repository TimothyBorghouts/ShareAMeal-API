const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

chai.should();
chai.use(chaiHttp);

//UC-201 - Toevoegen van een gebruiker.
describe('UC-201 - Toevoegen van een gebruiker', () => {});

//UC-202 - Bekijken van alle gebruikers.
describe('UC-202 - Bekijken van alle gebruikers', () => {});

//UC-203 - Het opvragen van een persoonlijk gebruikers profiel.
describe('UC-203 - Het opvragen van een persoonlijk gebruikers profiel', () => {});

//UC-204 - Een specifieke gebruiker opvragen.
describe('UC-204 - Een specifieke gebruiker opvragen', () => {});

//UC-205 - Verander een specifieke gebruiker.
describe('UC-205 - Verander een specifieke gebruiker', () => {});

//UC-206 - Verwijder een gebruiker.
describe('UC-206 - Verwijder een gebruiker', () => {});
