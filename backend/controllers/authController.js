const pool = require('../db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar usuario en tabla 'usuarios'
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1',
      [correo]
    );

    if (userResult.rows.length === 0) {
      // Buscar en solicitudes pendientes si no existe en usuarios
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

    // ⚠️ Comprobación temporal sin hashing
    const isPasswordValid = contrasena === user.contrasena;

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciales inválidas",
        error: true
      });
    }

    // 🔐 Generar token con ID y rol
    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      rol: user.rol,
      usuario_id: user.id,
      message: "Inicio de sesión exitoso"
    });

  } catch (error) {
    console.error('❌ Error de inicio de sesión:', error);
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
    // Validación básica de campos requeridos
    if (!nombre || !apellidos || !correo || !contrasena || !celular || !ci) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
        error: true
      });
    }

    // Verificar si ya existe en usuarios
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

    // Verificar si ya existe solicitud pendiente
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

    // Verificar si CI ya está solicitado
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

    // ✅ Insertar solicitud con estado 'pendiente'
    await pool.query(
      'INSERT INTO solicitudes_registro (nombre, apellidos, correo, contrasena, celular, ci, estado) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [nombre, apellidos, correo, contrasena, celular, ci, 'pendiente']
    );

    res.status(201).json({
      message: "Tu solicitud ha sido enviada y está pendiente de aprobación",
      error: false
    });

  } catch (error) {
    console.error('❌ Error al procesar solicitud:', error);
    res.status(500).json({
      message: "Error al procesar la solicitud",
      errorDetails: error.message,
      error: true
    });
  }
};
