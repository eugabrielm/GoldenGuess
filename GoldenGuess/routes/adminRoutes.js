const express = require('express');
const { isAdmin, cadastrarPremiacao, editarUsuario, excluirUsuario } = require('../controllers/adminController');
const router = express.Router();


router.post('/premiacao', isAdmin, cadastrarPremiacao);
router.put('/usuario/:id', isAdmin, editarUsuario);
router.delete('/usuario/:id', isAdmin, excluirUsuario);

module.exports = router;
