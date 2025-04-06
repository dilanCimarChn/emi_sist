const express = require('express');
const router = express.Router();
const pool = require('../db');

// ✅ Ruta para obtener todas las asignaturas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM asignaturas ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener asignaturas:', error);
    res.status(500).json({ error: 'Error al cargar las asignaturas' });
  }
});

module.exports = router; // << ESTE export debe estar correcto
