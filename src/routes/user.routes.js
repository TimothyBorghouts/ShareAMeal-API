const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

//UC-201 - Toevoegen van een gebruiker.
router.post("/api/user", userController.validateUser, userController.addUser);

//UC-202 - Bekijken van alle gebruikers.
router.get("/api/user", userController.getAllUsers);

//UC-203 - Het opvragen van een persoonlijk gebruikers profiel.
router.get("/api/user/profile", userController.getUserProfile);

//UC-204 - Een specifieke gebruiker opvragen.
router.get("/api/user/:userId", userController.getUserById);

//UC-205 - Verander een specifieke gebruiker.
router.put(
  "/api/user/:userId",
  userController.validateUser,
  userController.updateUserById
);

//UC-206 - Verwijder specifieke een gebruiker.
router.delete("/api/user/:userId", userController.deleteUserById);

module.exports = router;
