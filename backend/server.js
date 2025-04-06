const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const pool = require('./db');

// 🛣 Rutas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const docenteRoutes = require('./routes/docenteRoutes');

const app = express();
const port = process.env.PORT || 5000;

// ================================
// 🔐 Seguridad y configuración global
// ================================
app.use(helmet()); // Encabezados de seguridad

// 🌐 Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // Frontend en desarrollo
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
}));

// 💥 Limitador de peticiones
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV !== 'production' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// 🧠 Parseo de JSON y formularios
app.use(express.json({ limit: '10kb' }));

// 🖼 Archivos estáticos (certificados, fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================================
// 🚏 Rutas de la API
// ================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/docentes', docenteRoutes);

// 🧪 Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '✅ Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ================================
// ⚠️ Manejo de errores
// ================================

// ❌ Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    message: '❌ Ruta no encontrada',
    timestamp: new Date().toISOString()
  });
});

// ❌ Error interno del servidor
app.use((err, req, res, next) => {
  console.error('❌ Error interno:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    timestamp: new Date().toISOString()
  });
});

// ================================
// 🚀 Iniciar el servidor
// ================================
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});

// 🔌 Cierre limpio de la conexión a la base de datos
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('✅ Conexión a base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cerrando la conexión de base de datos:', error);
    process.exit(1);
  }
});
