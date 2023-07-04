const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const participateController = require('../controllers/participate.controller');

//UC-401 Aanmelden voor maaltijd
router.post('/api/meal/:mealId/participate', authController.validateToken, participateController.validateMealExistence, participateController.participateToMeal);

//UC-402 Afmelden voor maaltijd
router.delete(
  '/api/meal/:mealId/participate',
  authController.validateToken,
  participateController.validateMealExistence,
  participateController.checkIfParticipateExists,
  participateController.participateLeaveMeal
);

//UC-403 Opvragen van deelnemers
router.get(
  '/api/meal/:mealId/participants',
  authController.validateToken,
  participateController.validateMealExistence,
  // participateController.validateMealOwnership,
  participateController.checkIfParticipateExists,
  participateController.getAllParticipants
);

//UC-404 Opvragen van details van deelnemer
router.get(
  '/api/meal/:mealId/participants/:userId',
  authController.validateToken,
  participateController.validateMealExistence,
  // participateController.validateMealOwnership,
  participateController.checkIfParticipateExists,
  participateController.getParticipantsDetails
);

module.exports = router;
