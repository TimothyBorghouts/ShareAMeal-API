const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const mealController = require('../controllers/meal.controller');

//UC-301 - Toevoegen van maaltijd
router.post('/api/meal', authController.validateToken, mealController.validateMealInput, mealController.addMeal);

//UC-302 - Wijzigen van maaltijdgegevens
// router.put(
//   '/api/meal/:mealId',
//   authController.validateToken,
//   mealController.validateMealExistence,
//   mealController.validateMealInput,
//   mealController.validateMealOwnership,
//   mealController.updateMealById
// );

//UC-303 - Opvragen van alle maaltijden
router.get('/api/meal', authController.validateToken, mealController.getAllMeals);

//UC-304 - Opvragen van maaltijd bij ID
router.get('/api/meal/:mealId', authController.validateToken, mealController.validateMealExistence, mealController.getMealById);

// //UC-305 - Verwijderen van maaltijd
// router.delete('/api/meal/:mealId', authController.validateToken, mealController.validateMealExistence, mealController.validateMealOwnership, mealController.deleteMealById);

module.exports = router;
