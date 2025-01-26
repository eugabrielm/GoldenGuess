const express = require('express');
const { getPremiacoes, getCategorias, enviarPalpite, listarUsuarios} = require('../controllers/userController');
const router = express.Router();

router.get('/premiacoes', getPremiacoes);  // Listar premiações
router.get('/categorias/:premiacaoId', getCategorias);  // Listar categorias de uma premiação
router.post('/palpite', enviarPalpite);  // Registrar palpites
router.get('/usuarios',listarUsuarios)

module.exports = router;
