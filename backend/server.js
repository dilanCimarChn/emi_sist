const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const docenteRoutes = require('./routes/docenteRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔐 Seguridad HTTP con Helmet
app.use(helmet());

// 💥 Limitador de peticiones para evitar fuerza bruta
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Modo desarrollo: rateLimit relajado');
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
  }));
} else {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  }));
}

// 🌐 CORS - habilita acceso desde frontend
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600
}));

// 🧠 Parseo de JSON
app.use(express.json({ limit: '10kb' }));

// 📂 Servir archivos (fotos y certificados subidos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🚏 Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/docentes', docenteRoutes);

// 🔄 Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: '✅ Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// 🚫 Ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({
    message: '❌ Ruta no encontrada',
    timestamp: new Date().toISOString()
  });
});

// ⚠️ Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error interno:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    timestamp: new Date().toISOString()
  });
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});

// 🔌 Cierre limpio de conexión a DB
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