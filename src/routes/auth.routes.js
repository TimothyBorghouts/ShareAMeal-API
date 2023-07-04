const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

//UC-101 - Inloggen
router.post('/api/login', authController.validateLogin, authController.login);

//UC-102 - Opvragen van systeeminformatie
router.get('/api/info', authController.info);

module.exports = router;
