const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const { crearDocente, obtenerDocentePorUsuarioId } = require('../controllers/docenteController');
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

// 📌 Ruta protegida: Crear nuevo docente
router.post(
  '/crear',
  verificarToken,
  esDocente,
  upload.fields(fileFields),
  crearDocente
);

// 📌 Ruta protegida: Obtener docente por usuario_id
router.get(
  '/usuario/:usuarioId',
  verificarToken,
  esDocente,
  obtenerDocentePorUsuarioId
);

module.exports = router;
