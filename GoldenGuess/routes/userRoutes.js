const express = require('express');
const { getPremiacoes, getCategorias, enviarPalpite, listarUsuarios, getNomeados, salvarVoto, getUsuarioInfo, getUsuarioAtividade, getUsuarioResultados} = require('../controllers/userController');
const router = express.Router();

router.get('/premiacoes', getPremiacoes);  
router.get('/categorias/:premiacaoId', getCategorias);  
router.get('/nomeados/:categoriaId/:premiacaoId', getNomeados);
router.get('/info/:usuarioId', getUsuarioInfo);
router.get('/atividade/:usuarioId', getUsuarioAtividade);
router.get('/resultados/:usuarioId', getUsuarioResultados);
router.post('/palpite', enviarPalpite);  
router.post('/votos', salvarVoto);
router.get('/usuarios', listarUsuarios);

module.exports = router;