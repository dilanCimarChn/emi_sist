const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            message: "No se proporcionó token de autenticación",
            error: true
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Token inválido o expirado",
            error: true
        });
    }
};

exports.esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            message: "Acceso denegado. Se requiere rol de administrador",
            error: true
        });
    }
    next();
};

exports.esDocente = (req, res, next) => {
    if (req.usuario.rol !== 'docente') {
        return res.status(403).json({
            message: "Acceso denegado. Se requiere rol de docente",
            error: true
        });
    }
    next();
};