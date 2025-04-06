const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const {
  crearDocente,
  obtenerDocentePorUsuarioId,
  getDocentePorId,
  getTodosLosDocentes,
  actualizarDocente,
  obtenerEstudiosPorDocente // ✅ Importación agregada
} = require('../controllers/docenteController');

const { verificarToken, esDocente } = require('../middleware/authMiddleware');

// 🧪 Ruta de prueba
router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Ruta /api/docentes/test activa ✅',
    timestamp: new Date().toISOString()
  });
});

// 📎 Campos esperados para subir con multer (máximo 10 por tipo)
const fileFields = [{ name: 'fotografia', maxCount: 1 }];
for (let i = 0; i < 10; i++) {
  fileFields.push({ name: `diplomados[${i}][certificado]`, maxCount: 1 });
  fileFields.push({ name: `maestrias[${i}][certificado]`, maxCount: 1 });
  fileFields.push({ name: `phds[${i}][certificado]`, maxCount: 1 });
}

// 📥 Crear nuevo docente (protegido con auth y multer)
router.post(
  '/crear',
  verificarToken,
  esDocente,
  upload.fields(fileFields),
  crearDocente
);

// 🔐 Obtener docente por usuario_id (protegido)
router.get(
  '/usuario/:usuarioId',
  verificarToken,
  esDocente,
  obtenerDocentePorUsuarioId
);

// 📄 Obtener estudios de un docente por su ID (sin protección porque es vista admin)
router.get('/estudios/:docente_id', obtenerEstudiosPorDocente);

// 📋 Obtener todos los docentes (por admin o para mostrar lista)
router.get('/', getTodosLosDocentes);

// 🔍 Obtener un docente específico por su ID
router.get('/:id', getDocentePorId);

// ✏️ Actualizar datos del docente
router.put('/:id', actualizarDocente);

module.exports = router;