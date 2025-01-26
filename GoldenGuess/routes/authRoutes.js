const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para cadastrar o usuário
router.post('/register', authController.registerUser);

// Rota para login do usuário
router.post('/login', authController.loginUser);

module.exports = router;
