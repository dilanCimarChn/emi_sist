const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const {
  crearDocente,
  obtenerDocentePorUsuarioId,
  getDocentePorId,
  getTodosLosDocentes,
  actualizarDocente,
  obtenerEstudiosPorDocente
} = require('../controllers/docenteController');

const { verificarToken, esDocente } = require('../middleware/authMiddleware');

// 🧪 Ruta de prueba
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Ruta /api/docentes/test activa ✅',
    timestamp: new Date().toISOString()
  });
});

// 📎 Campos para subir múltiples archivos (máximo 10 por tipo)
const fileFields = [{ name: 'fotografia', maxCount: 1 }];
for (let i = 0; i < 10; i++) {
  fileFields.push({ name: `diplomados[${i}][certificado]`, maxCount: 1 });
  fileFields.push({ name: `maestrias[${i}][certificado]`, maxCount: 1 });
  fileFields.push({ name: `phds[${i}][certificado]`, maxCount: 1 });
}

// 📝 Crear nuevo docente (con token y subida de archivos)
router.post(
  '/crear',
  verificarToken,
  esDocente,
  upload.fields(fileFields),
  crearDocente
);

// 🔐 Obtener docente por usuario_id (protección por token)
router.get(
  '/usuario/:usuarioId',
  verificarToken,
  esDocente,
  obtenerDocentePorUsuarioId
);

// 📄 Obtener estudios de un docente por ID
router.get('/estudios/:docente_id', obtenerEstudiosPorDocente);

// 📋 Obtener todos los docentes
router.get('/', getTodosLosDocentes);

// 🔍 Obtener un docente específico por su ID
router.get('/:id', getDocentePorId);

// ✏️ Actualizar datos del docente
router.put('/:id', actualizarDocente);

module.exports = router;
