const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const authController = require("../controllers/auth.controller");

//UC-301 - Toevoegen van een maaltijd.
router.post(
  "/api/meal",
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
);

//UC-302 - Bekijken van alle maaltijden.
router.get("/api/meal", mealController.getAllMeals);

//UC-303 - Een specifieke maaltijd opvragen.
router.get(
  "/api/meal/:mealId",
  authController.validateToken,
  mealController.getMealById
);

//UC-304 - Verander een specifieke maaltijd.
router.put(
  "/api/meal/:mealId",
  authController.validateToken,
  mealController.updateMealById
);

//UC-305 - Verwijder een specifieke maaltijd
router.delete(
  "/api/meal/:mealId",
  authController.validateToken,
  mealController.deleteMealById
);

module.exports = router;
