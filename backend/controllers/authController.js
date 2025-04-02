exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;
    
    try {
        // Verificar si existe en usuarios
        const userResult = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1',
            [correo]
        );
        
        if (userResult.rows.length === 0) {
            // Verificar si existe como solicitud pendiente
            const solicitudResult = await pool.query(
                'SELECT * FROM solicitudes_registro WHERE correo = $1 AND estado = $2',
                [correo, 'pendiente']
            );
            
            if (solicitudResult.rows.length > 0) {
                return res.status(403).json({
                    message: "Tu solicitud está pendiente de aprobación por el administrador",
                    error: true
                });
            }
            
            return res.status(404).json({
                message: "Usuario no registrado",
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
        
        // Si es docente, obtener su ID de la tabla docentes
        let docenteId = null;
        if (user.rol === 'docente') {
            const docenteResult = await pool.query(
                'SELECT id FROM docentes WHERE usuario_id = $1',
                [user.id]
            );
            
            if (docenteResult.rows.length > 0) {
                docenteId = docenteResult.rows[0].id;
            }
        }
        
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );
        
        res.json({
            token,
            rol: user.rol,
            id: user.rol === 'admin' ? user.id : docenteId,
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