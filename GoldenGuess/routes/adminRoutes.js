const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/salvar-premiacao-primeira-fase', adminController.salvarPremiacaoPrimeiraFase);
router.post('/salvar-premiacao-segunda-fase', adminController.salvarPremiacaoSegundaFase);
router.get('/buscar-premiacoes-primeira-fase', adminController.buscarPremiacoesPrimeiraFase);
router.get('/buscar-categorias', adminController.buscarCategorias);
router.get('/buscar-premiacoes-votacao', adminController.buscarPremiacoesVotacao);
router.get('/buscar-indicados', adminController.buscarIndicados);
router.post('/salvar-vencedores', adminController.salvarVencedores);

module.exports = router;