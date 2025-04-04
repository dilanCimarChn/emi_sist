const pool = require('../db');

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

    // Estudios (diplomado, maestría, phd)
    const estudios = [];
    const extraerEstudios = (prefix, tipo) => {
      Object.keys(req.body).forEach(key => {
        if (key.startsWith(prefix)) {
          const [, index, field] = key.match(/\[(\d+)\]\[(\w+)\]/) || [];
          if (index !== undefined && field) {
            if (!estudios[index]) estudios[index] = { tipo };
            estudios[index][field] = req.body[key];
          }
        }
      });
    };

    extraerEstudios('diplomados', 'diplomado');
    extraerEstudios('maestrias', 'maestria');
    extraerEstudios('phds', 'phd');

    const files = req.files || {};
    Object.keys(files).forEach(field => {
      const match = field.match(/(diplomados|maestrias|phds)\[(\d+)\]\[certificado\]/);
      if (match) {
        const index = parseInt(match[2]);
        if (!estudios[index]) estudios[index] = {};
        estudios[index].certificado = files[field][0]?.filename || null;
      }
    });

    for (const est of estudios) {
      if (est && est.universidad && est.anio) {
        await client.query(
          `INSERT INTO estudios (docente_id, tipo, universidad, anio, certificado)
           VALUES ($1, $2, $3, $4, $5)`,
          [docenteId, est.tipo, est.universidad, est.anio, est.certificado || null]
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

module.exports = { crearDocente, obtenerDocentePorUsuarioId };
