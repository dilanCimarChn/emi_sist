const pool = require('../db');
const emailService = require('../services/emailService'); // ← Única línea nueva agregada

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

        // ========== NUEVA FUNCIONALIDAD DE CORREO ==========
        // Enviar email de confirmación al docente
        let emailInfo = null;
        try {
            const resultadoEmail = await emailService.enviarConfirmacionAprobacion({
                nombre: solicitud.nombre,
                apellidos: solicitud.apellidos,
                correo: solicitud.correo
            });

            emailInfo = {
                enviado: resultadoEmail.success,
                mensaje: resultadoEmail.success ?
                    'Email de confirmación enviado' :
                    `Error enviando email: ${resultadoEmail.error}`
            };

            console.log(`✅ Solicitud ${id} aprobada para ${solicitud.correo}`);
        } catch (emailError) {
            console.error('Error al enviar email de aprobación:', emailError);
            emailInfo = {
                enviado: false,
                mensaje: `Error enviando email: ${emailError.message}`
            };
        }
        // =================== FIN NUEVA FUNCIONALIDAD ===================

        // Confirmar transacción
        await pool.query('COMMIT');

        res.json({
            message: "Solicitud aprobada correctamente",
            usuario_id: userId,
            // Información adicional del email (opcional)
            email: emailInfo
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
        // ========== NUEVA FUNCIONALIDAD: Obtener datos antes del rechazo ==========
        const solicitudResult = await pool.query(
            'SELECT nombre, apellidos, correo FROM solicitudes_registro WHERE id = $1 AND estado = $2',
            [id, 'pendiente']
        );

        if (solicitudResult.rows.length === 0) {
            return res.status(404).json({
                message: "Solicitud no encontrada o ya procesada",
                error: true
            });
        }

        const solicitud = solicitudResult.rows[0];
        // =================== FIN NUEVA FUNCIONALIDAD ===================

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

        // ========== NUEVA FUNCIONALIDAD DE CORREO ==========
        // Enviar email de notificación de rechazo
        let emailInfo = null;
        try {
            const resultadoEmail = await emailService.enviarNotificacionRechazo({
                nombre: solicitud.nombre,
                apellidos: solicitud.apellidos,
                correo: solicitud.correo
            });

            emailInfo = {
                enviado: resultadoEmail.success,
                mensaje: resultadoEmail.success ?
                    'Email de notificación enviado' :
                    `Error enviando email: ${resultadoEmail.error}`
            };

            console.log(`❌ Solicitud ${id} rechazada para ${solicitud.correo}`);
        } catch (emailError) {
            console.error('Error al enviar email de rechazo:', emailError);
            emailInfo = {
                enviado: false,
                mensaje: `Error enviando email: ${emailError.message}`
            };
        }
        // =================== FIN NUEVA FUNCIONALIDAD ===================

        res.json({
            message: "Solicitud rechazada correctamente",
            // Información adicional del email (opcional)
            email: emailInfo
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