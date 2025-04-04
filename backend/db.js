const { Pool } = require('pg');
require('dotenv').config();

// Función para validar configuración de base de datos
const validateDbConfig = () => {
    const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
    
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            console.error(`Variable de entorno ${envVar} no está definida`);
        }
    });

    
    console.log('Configuración de base de datos:');
    console.log('Usuario:', process.env.DB_USER);
    console.log('Host:', process.env.DB_HOST);
    console.log('Base de datos:', process.env.DB_NAME);
    console.log('Puerto:', process.env.DB_PORT);
};

// Configuración de conexión con más opciones de depuración
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
    
    // Opciones de conexión para mayor robustez
    max: 20, // Máximo número de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo de espera de conexiones inactivas
    connectionTimeoutMillis: 5000, // Tiempo máximo para establecer conexión
    
    // Configuraciones de autenticación
    ssl: false, // Cambia a true si tu base de datos requiere SSL
});

// Validar configuración al iniciar
validateDbConfig();

// Manejadores de eventos de conexión
pool.on('connect', () => {
    console.log('✅ Conexión a base de datos establecida correctamente');
});

pool.on('error', (err) => {
    console.error('❌ Error inesperado en la conexión a la base de datos:', err);
});

module.exports = pool;