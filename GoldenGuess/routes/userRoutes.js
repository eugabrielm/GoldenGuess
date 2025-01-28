const express = require('express');
const { getPremiacoes, getCategorias, enviarPalpite, listarUsuarios} = require('../controllers/userController');
const router = express.Router();

router.get('/premiacoes', getPremiacoes);  
router.get('/categorias/:premiacaoId', getCategorias);  
router.post('/palpite', enviarPalpite);  
router.get('/usuarios',listarUsuarios)

module.exports = router;