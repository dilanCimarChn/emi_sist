const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const {
  crearDocente,
  obtenerDocentePorUsuarioId,
  getDocentePorId,
  getTodosLosDocentes,
  actualizarDocente
} = require('../controllers/docenteController');
const { verificarToken, esAdmin, esDocente } = require('../middleware/authMiddleware');

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

// 📥 Crear nuevo docente (protegido con multer y auth)
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

// 🧾 Obtener todos los docentes
router.get('/', getTodosLosDocentes); // ⚠️ Esta debe ir antes de "/:id"

// 🔍 Obtener un docente por ID
router.get('/:id', getDocentePorId);

// ✏️ Actualizar datos del docente
router.put('/:id', actualizarDocente);

module.exports = router;