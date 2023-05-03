const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

//UC-101 - Inloggen als gebruiken.
router.post('/api/auth/login', authController.validateLogin, authController.login);

module.exports = router;
