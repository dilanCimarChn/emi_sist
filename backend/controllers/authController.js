const pool = require('../db');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService'); // ← Única línea nueva agregada

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

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      rol: user.rol,
      usuario_id: user.id,
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

exports.solicitarRegistro = async (req, res) => {
  const { nombre, apellidos, correo, contrasena, celular, ci } = req.body;

  try {
    // Verificar si el correo ya existe en usuarios
    const existeUsuario = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({
        message: "Este correo ya está registrado en el sistema",
        error: true
      });
    }

    // Verificar si ya existe una solicitud pendiente
    const existeSolicitud = await pool.query(
      'SELECT * FROM solicitudes_registro WHERE correo = $1 AND estado = $2',
      [correo, 'pendiente']
    );

    if (existeSolicitud.rows.length > 0) {
      return res.status(400).json({
        message: "Ya existe una solicitud pendiente para este correo",
        error: true
      });
    }

    // Verificar si el CI ya existe
    const existeCI = await pool.query(
      'SELECT * FROM solicitudes_registro WHERE ci = $1 AND estado = $2',
      [ci, 'pendiente']
    );

    if (existeCI.rows.length > 0) {
      return res.status(400).json({
        message: "Ya existe una solicitud pendiente para este CI",
        error: true
      });
    }

    // Guardar la solicitud
    const result = await pool.query(
      'INSERT INTO solicitudes_registro (nombre, apellidos, correo, contrasena, celular, ci, estado,fecha_solicitud)VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING id',
      [nombre, apellidos, correo, contrasena, celular, ci,'pendiente']
    );

    // ========== NUEVA FUNCIONALIDAD DE CORREO ==========
    // Preparar datos para el email de notificación al administrador
    const datosSolicitud = {
      nombre,
      apellidos,
      correo,
      ci,
      celular,
      fecha_solicitud: new Date().toISOString(),
      solicitudId: result.rows[0].id
    };

    // Enviar notificación al administrador (no bloqueante)
    let emailInfo = null;
    try {
      const resultadoEmail = await emailService.enviarNotificacionNuevaSolicitud(datosSolicitud);

      emailInfo = {
        enviado: resultadoEmail.success,
        mensaje: resultadoEmail.success ?
          'Administrador notificado sobre nueva solicitud' :
          `Error notificando administrador: ${resultadoEmail.error}`
      };

      if (resultadoEmail.success) {
        console.log(`📧 Administrador notificado sobre nueva solicitud de: ${correo}`);
      }
    } catch (emailError) {
      console.error('Error al enviar notificación al administrador:', emailError);
      emailInfo = {
        enviado: false,
        mensaje: `Error notificando administrador: ${emailError.message}`
      };
    }

    console.log(`📝 Nueva solicitud registrada: ${correo} (ID: ${result.rows[0].id})`);
    // =================== FIN NUEVA FUNCIONALIDAD ===================

    res.status(201).json({
      message: "Tu solicitud ha sido enviada y está pendiente de aprobación",
      error: false,
      // Información adicional del email (opcional)
      notificacion: emailInfo
    });
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    res.status(500).json({
      message: "Error al procesar la solicitud",
      errorDetails: error.message,
      error: true
    });
  }
};