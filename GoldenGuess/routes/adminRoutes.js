const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/salvar-premiacao', adminController.salvarPremiacao);

module.exports = router;
