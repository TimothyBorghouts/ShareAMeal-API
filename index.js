const express = require("express");
const app = express();
const port = process.env.Port || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let userDatabase = [];
let userId = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

//Wanneer er niks bij wordt gezet dan wordt er hello world terug gestuurd.
app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Hello World!",
  });
});

//Toevoegen van een gebruiker aan de gebruiker database. De gebruiker moet een unieke e-email hebben
app.post("/api/users", (req, res) => {
  let user = req.body;
  userId++;
  user = {
    userId,
    ...user,
  };
  userDatabase.push(user);
  res.status(201).json({
    status: 201,
    result: userDatabase,
  });
});

//Bekijken van alle gebruikers in de gebruiker database.
app.get("/api/users", (req, res, next) => {
  res.status(202).json({
    status: 202,
    result: userDatabase,
  });
});

//Het opvragen van een persoonlijk gebruikers profiel
//Toont alleen een melding dat de functionaliteit niet werkt omdat dat niet gerealizeerd hoefde te worden.
app.get("/api/users/profile", (req, res) => {
  res.status(203).json({
    status: 203,
    result: "Deze functionaliteit is nog niet gerealiseerd.",
  });
});

//Een specifieke gebruiker opvragen uit de gebruiker database.
app.get("/api/users/:userId", (req, res, next) => {
  const userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);
  console.log(`User met ID ${id} gezocht`);
  if (user.length > 0) {
    res.status(204).json({
      status: 204,
      result: user,
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

//Verander een specifieke gebruiker uit de gebruiker database.
app.put("/api/users/:userId", (req, res, next) => {
  const userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);
  console.log(`User met ID ${id} gezocht`);
  if (user.length > 0) {
    res.status(205).json({
      status: 205,
      result: "Gebruiker is gewijzigd in de database",
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

//Verwijder een gebruiker uit de gebruiker database
app.delete("/api/users/:userId", (req, res, next) => {
  const userId = req.params.userId;
  let user = database.filter((item) => item.id == userId);
  console.log(`User met ID ${id} gezocht`);
  if (user.length > 0) {
    userDatabase.pop();
    res.status(205).json({
      status: 205,
      result: "Gebruiker is verwijderd uit de database",
    });
  } else {
    res.status(401).json({
      status: 401,
      result: `User with ID ${userId} not found`,
    });
  }
});

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
