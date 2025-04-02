const express = require('express');
const router = express.Router();
const { verificarToken, esAdmin, esDocente } = require('../middleware/authMiddleware');
const { 
    getDocentes, 
    getDocenteById, 
    updateDocente, 
    uploadFoto 
} = require('../controllers/docenteController');
const multer = require('multer');

// Configuración para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/fotosDocentes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `docente-${req.params.id}-${uniqueSuffix}.${ext}`);
    }
});

const upload = multer({ storage: storage });

// Rutas protegidas para administradores
router.get('/', verificarToken, esAdmin, getDocentes);
router.get('/:id', verificarToken, getDocenteById);
router.post('/:id/foto', verificarToken, upload.single('foto'), uploadFoto);

// Rutas para docentes (pueden actualizar sus propios datos)
router.put('/:id', verificarToken, updateDocente);

module.exports = router;