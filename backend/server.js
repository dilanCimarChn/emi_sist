const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Configuración de seguridad
app.use(helmet()); // Configura cabeceras HTTP seguras

// Limitador de solicitudes para prevenir ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // Máximo 100 solicitudes por IP
});
app.use(limiter);

// Configuración de CORS más restrictiva
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600
}));

app.use(express.json({ 
    limit: '10kb' // Limitar tamaño de solicitudes JSON
}));

// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Backend funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : null,
        timestamp: new Date().toISOString()
    });
});

// Manejar rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({
        message: 'Ruta no encontrada',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Manejo de cierre de servidor y conexión de base de datos
process.on('SIGINT', async () => {
    try {
        await pool.end();
        console.log('Conexión de base de datos cerrada');
        process.exit(0);
    } catch (error) {
        console.error('Error cerrando la conexión de base de datos:', error);
        process.exit(1);
    }
});