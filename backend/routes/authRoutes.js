const express = require('express');
const router = express.Router();
const { login, solicitarRegistro } = require('../controllers/authController');

// Rutas públicas
router.post('/login', login);
router.post('/solicitar-registro', solicitarRegistro);

module.exports = router;