const pool = require('../db');

// Obtener todas las solicitudes pendientes
exports.getSolicitudesPendientes = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre, apellidos, correo, celular, ci, fecha_solicitud FROM solicitudes_registro WHERE estado = $1 ORDER BY fecha_solicitud DESC',
            ['pendiente']
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({
            message: "Error al obtener solicitudes pendientes",
            error: true
        });
    }
};

// Aprobar una solicitud
exports.aprobarSolicitud = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Iniciar transacción
        await pool.query('BEGIN');
        
        // Obtener datos de la solicitud
        const solicitudResult = await pool.query(
            'SELECT * FROM solicitudes_registro WHERE id = $1',
            [id]
        );
        
        if (solicitudResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({
                message: "Solicitud no encontrada",
                error: true
            });
        }
        
        const solicitud = solicitudResult.rows[0];
        
        // Crear usuario
        const userResult = await pool.query(
            'INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [solicitud.nombre, solicitud.apellidos, solicitud.correo, solicitud.contrasena, 'docente']
        );
        
        const userId = userResult.rows[0].id;
        
        // Actualizar estado de la solicitud
        await pool.query(
            'UPDATE solicitudes_registro SET estado = $1, fecha_respuesta = CURRENT_TIMESTAMP WHERE id = $2',
            ['aprobada', id]
        );
        
        // Confirmar transacción
        await pool.query('COMMIT');
        
        res.json({
            message: "Solicitud aprobada correctamente",
            usuario_id: userId
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al aprobar solicitud:', error);
        res.status(500).json({
            message: "Error al aprobar la solicitud",
            error: true
        });
    }
};

// Rechazar una solicitud
exports.rechazarSolicitud = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'UPDATE solicitudes_registro SET estado = $1, fecha_respuesta = CURRENT_TIMESTAMP WHERE id = $2',
            ['rechazada', id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Solicitud no encontrada",
                error: true
            });
        }
        
        res.json({
            message: "Solicitud rechazada correctamente"
        });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        res.status(500).json({
            message: "Error al rechazar la solicitud",
            error: true
        });
    }
};

// Contar solicitudes pendientes
exports.contarSolicitudesPendientes = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT COUNT(*) as pendientes FROM solicitudes_registro WHERE estado = $1',
            ['pendiente']
        );
        
        res.json({
            count: parseInt(result.rows[0].pendientes)
        });
    } catch (error) {
        console.error('Error al contar solicitudes:', error);
        res.status(500).json({
            message: "Error al contar solicitudes pendientes",
            error: true
        });
    }
};