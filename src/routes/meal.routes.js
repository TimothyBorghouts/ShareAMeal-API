const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const mealController = require('../controllers/meal.controller');

//UC-301 - Toevoegen van een maaltijd.
router.post('/api/meal', authController.validateToken, mealController.validateMeal, mealController.addMeal);

//UC-302 - Verander een specifieke maaltijd.
router.put('/api/meal/:mealId', authController.validateToken, mealController.validateMeal, mealController.updateMealById);

//UC-303 - Bekijken van alle maaltijden.
router.get('/api/meal', authController.validateToken, mealController.getAllMeals);

//UC-304 - Een specifieke maaltijd opvragen.
router.get('/api/meal/:mealId', authController.validateToken, mealController.getMealById);

//UC-305 - Verwijder een specifieke maaltijd
router.delete('/api/meal/:mealId', authController.validateToken, mealController.deleteMealById);

module.exports = router;
