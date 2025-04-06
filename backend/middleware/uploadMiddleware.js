const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 📁 Ruta donde se guardarán los archivos
const uploadDir = path.join(__dirname, '../uploads');

// 📌 Asegurar que la carpeta uploads exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Carpeta "uploads/" creada automáticamente');
}

// 🧠 Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // extensión
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/\s+/g, '-')      // reemplazar espacios por guiones
      .replace(/[^a-zA-Z0-9.-]/g, ''); // quitar caracteres no válidos

    cb(null, `${timestamp}-${file.fieldname}-${safeName}`);
  }
});

// 🧱 Inicializar el middleware
const upload = multer({ storage });

module.exports = upload;