const express = require("express");
const app = express();
const router = express.Router();
const userController = require("../controllers/user.controller");

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

//201 - Toevoegen van een gebruiker aan de gebruiker database.
app.post("/api/user", userController.addUser);

//202 - Bekijken van alle gebruikers in de gebruiker database.
app.get("/api/user", userController.getAllUsers);

//203 - Het opvragen van een persoonlijk gebruikers profiel
app.get("/api/user/profile", userController.getUserProfile);

//204 - Een specifieke gebruiker opvragen uit de gebruiker database.
app.get("/api/user/:userId", userController.getSpecificUser);

//205 - Verander een specifieke gebruiker uit de gebruiker database.
app.put("/api/user/:userId", userController.changeUser);

//206 - Verwijder een gebruiker uit de gebruiker database
app.delete("/api/user/:userId", userController.deleteUser);

module.exports = router;
