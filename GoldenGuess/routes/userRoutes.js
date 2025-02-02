const express = require('express');
const { getPremiacoes, getCategorias, enviarPalpite, listarUsuarios, getNomeados, salvarVoto} = require('../controllers/userController');
const router = express.Router();

router.get('/premiacoes', getPremiacoes);  
router.get('/categorias/:premiacaoId', getCategorias);  
router.get('/nomeados/:categoriaId/:premiacaoId', getNomeados);
router.post('/palpite', enviarPalpite);  
router.post('/votos', salvarVoto);
router.get('/usuarios', listarUsuarios);
module.exports = router;