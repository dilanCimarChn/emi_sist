const pool = require('../db');

// ✅ Crear Docente con estudios como arrays
const crearDocente = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log("📦 req.body:", req.body);
    console.log("🖼 req.files:", req.files);

    await client.query('BEGIN');

    const {
      usuario_id, nombres, apellidos, correo_electronico, ci, genero,
      grado_academico, titulo, anio_titulacion, universidad,
      experiencia_laboral, experiencia_docente, categoria_docente,
      modalidad_ingreso, asignaturas
    } = req.body;

    if (!usuario_id) throw new Error('usuario_id es obligatorio');

    const fotografia = req.files?.['fotografia']?.[0]?.filename || null;

    const result = await client.query(
      `INSERT INTO docentes (
        usuario_id, nombres, apellidos, correo_electronico, ci,
        genero, grado_academico, titulo, anio_titulacion, universidad,
        experiencia_laboral, experiencia_docente, categoria_docente,
        modalidad_ingreso, asignaturas, fotografia
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16
      ) RETURNING id`,
      [
        usuario_id, nombres, apellidos, correo_electronico, ci,
        genero, grado_academico, titulo, anio_titulacion, universidad,
        experiencia_laboral, experiencia_docente, categoria_docente,
        modalidad_ingreso, asignaturas, fotografia
      ]
    );

    const docenteId = result.rows[0]?.id;
    if (!docenteId) throw new Error('No se obtuvo ID del docente insertado');

    const estudios = [];

    const parseEstudios = (tipo, bodyField) => {
      const array = JSON.parse(req.body[bodyField] || '[]');
      array.forEach((item, i) => {
        estudios.push({
          tipo,
          universidad: item.universidad,
          anio: parseInt(item.anio),
          certificado: req.files?.[`${bodyField}[${i}][certificado]`]?.[0]?.filename || null
        });
      });
    };

    parseEstudios('diplomado', 'diplomados');
    parseEstudios('maestria', 'maestrias');
    parseEstudios('phd', 'phds');

    console.log("🧾 Estudios final procesados:", estudios);

    for (const est of estudios) {
      if (est.universidad && est.anio) {
        await client.query(
          `INSERT INTO estudios (docente_id, tipo, universidad, anio, certificado)
           VALUES ($1, $2, $3, $4, $5)`,
          [docenteId, est.tipo, est.universidad, est.anio, est.certificado]
        );
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: '✅ Docente y estudios guardados exitosamente.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al registrar docente:', error.message);
    res.status(500).json({
      error: 'Error al guardar los datos del docente.',
      detalle: error.message
    });
  } finally {
    client.release();
  }
};

// ✅ Obtener docente por usuario_id
const obtenerDocentePorUsuarioId = async (req, res) => {
  const { usuarioId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM docentes WHERE usuario_id = $1', [usuarioId]);
    if (result.rows.length > 0) {
      res.status(200).json({ docente: result.rows[0] });
    } else {
      res.status(404).json({ message: 'No se encontró docente con ese usuario_id' });
    }
  } catch (error) {
    console.error('❌ Error al obtener docente:', error);
    res.status(500).json({ error: 'Error al buscar docente por usuario_id' });
  }
};

// ✅ Obtener docente por ID (admin)
const getDocentePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const docenteResult = await pool.query('SELECT * FROM docentes WHERE id = $1', [id]);
    if (docenteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    const docente = docenteResult.rows[0];

    const estudiosResult = await pool.query('SELECT * FROM estudios WHERE docente_id = $1', [id]);
    docente.estudios = estudiosResult.rows;

    res.json(docente);
  } catch (error) {
    console.error('Error al obtener el docente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ✅ Obtener todos los docentes
const getTodosLosDocentes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM docentes ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener docentes:', error);
    res.status(500).json({ error: 'Error al obtener la lista de docentes' });
  }
};

// ✅ Actualizar docente
const actualizarDocente = async (req, res) => {
  const { id } = req.params;
  const {
    nombres, apellidos, correo_electronico, grado_academico,
    titulo, universidad, anio_titulacion
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE docentes SET
        nombres = $1,
        apellidos = $2,
        correo_electronico = $3,
        grado_academico = $4,
        titulo = $5,
        universidad = $6,
        anio_titulacion = $7
      WHERE id = $8 RETURNING *`,
      [
        nombres, apellidos, correo_electronico,
        grado_academico, titulo, universidad,
        anio_titulacion, id
      ]
    );

    res.status(200).json({ message: 'Docente actualizado', docente: result.rows[0] });
  } catch (error) {
    console.error('❌ Error actualizando docente:', error);
    res.status(500).json({ error: 'Error al actualizar el docente' });
  }
};

// ✅ NUEVO: Obtener estudios por docente_id
const obtenerEstudiosPorDocente = async (req, res) => {
  const { docente_id } = req.params;

  try {
    const query = `
      SELECT id, tipo, universidad, anio, certificado
      FROM estudios
      WHERE docente_id = $1
      ORDER BY anio DESC
    `;
    const result = await pool.query(query, [docente_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener estudios:', error);
    res.status(500).json({ error: 'Error al obtener estudios del docente' });
  }
};


// ✅ Exportación de todos los controladores
module.exports = {
  crearDocente,
  obtenerDocentePorUsuarioId,
  getDocentePorId,
  getTodosLosDocentes,
  actualizarDocente,
  obtenerEstudiosPorDocente // 👈 Nuevo export
};