const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');
const { 
    getSolicitudesPendientes, 
    aprobarSolicitud, 
    rechazarSolicitud,
    contarSolicitudesPendientes
} = require('../controllers/adminController');

// Todas las rutas de admin deben verificar token y rol
router.use(verificarToken);
router.use(esAdmin);

// Rutas para administración de solicitudes
router.get('/solicitudes', getSolicitudesPendientes);
router.post('/solicitudes/:id/aprobar', aprobarSolicitud);
router.post('/solicitudes/:id/rechazar', rechazarSolicitud);
router.get('/solicitudes/pendientes/count', contarSolicitudesPendientes);

module.exports = router;