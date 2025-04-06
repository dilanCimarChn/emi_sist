// controllers/asignaturaController.js
const pool = require('../db');

const obtenerAsignaturas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asignaturas ORDER BY nombre ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener asignaturas:', error);
    res.status(500).json({ error: 'Error al obtener asignaturas' });
  }
};

module.exports = { obtenerAsignaturas };
