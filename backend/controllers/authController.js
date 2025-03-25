const pool = require('../db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const userResult = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1', 
            [correo]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                message: "Usuario no encontrado",
                error: true 
            });
        }

        const user = userResult.rows[0];

        // CAMBIO TEMPORAL PARA CONTRASEÑAS EN TEXTO PLANO:
        const isPasswordValid = contrasena === user.contrasena;

        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Credenciales inválidas",
                error: true 
            });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            rol: user.rol,
            message: "Inicio de sesión exitoso"
        });

    } catch (error) {
        console.error('Error de inicio de sesión:', error);
        res.status(500).json({
            message: "Error interno del servidor",
            errorDetails: error.message,
            error: true
        });
    }
};
