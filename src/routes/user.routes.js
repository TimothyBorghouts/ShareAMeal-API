const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

//UC-201 - Registreren als nieuwe user
router.post('/api/user', userController.validateUser, userController.addUser);

//UC-202 - Opvragen overzicht van user
router.get('/api/user', /*authController.validateToken,*/ userController.getAllUsers);

//UC-203 - Opvragen van gebruikersprofiel
router.get('/api/user/profile', /*authController.validateToken,*/ userController.getUserProfile);

//UC-204 - Opvragen van usergegevens bij ID
router.get('/api/user/:userId', /*authController.validateToken,*/ userController.getUserById);

//UC-205 - Wijzigen van usergegevens
router.put('/api/user/:userId', /*authController.validateToken,*/ userController.validateUser, userController.validatePhoneNumber, userController.updateUserById);

//UC-206 - Verwijderen van user
router.delete('/api/user/:userId', /*authController.validateToken,*/ userController.deleteUserById);

module.exports = router;
