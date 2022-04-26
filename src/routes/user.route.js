const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

//201 - Toevoegen van een gebruiker aan de gebruiker database.
router.post("/api/user", userController.validateUser, userController.addUser);

//202 - Bekijken van alle gebruikers in de gebruiker database.
router.get("/api/user", userController.getAllUsers);

//203 - Het opvragen van een persoonlijk gebruikers profiel
router.get("/api/user/profile", userController.getUserProfile);

//204 - Een specifieke gebruiker opvragen uit de gebruiker database.
router.get("/api/user/:userId", userController.getSpecificUser);

//205 - Verander een specifieke gebruiker uit de gebruiker database.
router.put("/api/user/:userId", userController.changeUser);

//206 - Verwijder een gebruiker uit de gebruiker database
router.delete("/api/user/:userId", userController.deleteUser);

module.exports = router;
