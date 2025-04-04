const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const {
  crearDocente,
  obtenerDocentePorUsuarioId,
  getDocentePorId,
  getTodosLosDocentes // 👈 importante
} = require('../controllers/docenteController');
const { verificarToken, esDocente } = require('../middleware/authMiddleware');



// Ruta de prueba
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Ruta /api/docentes/test activa ✅',
    timestamp: new Date().toISOString()
  });
});

// Campos esperados para multer (fotografía + certificados dinámicos)
const fileFields = [{ name: 'fotografia', maxCount: 1 }];
for (let i = 0; i < 10; i++) {
  fileFields.push({ name: `diplomados[${i}][certificado]`, maxCount: 1 });
  fileFields.push({ name: `maestrias[${i}][certificado]`, maxCount: 1 });
  fileFields.push({ name: `phds[${i}][certificado]`, maxCount: 1 });
}

// Ruta protegida: Crear nuevo docente
router.post(
  '/crear',
  verificarToken,
  esDocente,
  upload.fields(fileFields),
  crearDocente
);

// Ruta protegida: Obtener docente por usuario_id
router.get(
  '/usuario/:usuarioId',
  verificarToken,
  esDocente,
  obtenerDocentePorUsuarioId
);

router.get('/', getTodosLosDocentes); // ✅ Esta debe ir antes de /:id
// ✅ NUEVA RUTA para obtener un docente por su ID (usada en DetalleDocente.jsx)
router.get('/:id', getDocentePorId);

module.exports = router;

const { actualizarDocente } = require('../controllers/docenteController');

router.put('/:id', actualizarDocente);
