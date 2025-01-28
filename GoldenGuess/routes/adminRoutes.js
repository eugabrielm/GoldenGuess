const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rota para salvar premiação - Primeira Fase
router.post('/salvar-premiacao-primeira-fase', adminController.salvarPremiacaoPrimeiraFase);
// Adicionar rota para Segunda Fase
router.post('/salvar-premiacao-segunda-fase', adminController.salvarPremiacaoSegundaFase);


module.exports = router;
