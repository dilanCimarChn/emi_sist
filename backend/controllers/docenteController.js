const pool = require('../db');

// Crear Docente con estudios y asignaturas
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

    // ✅ VALIDACIÓN MEJORADA
    if (!usuario_id || usuario_id === 'undefined' || usuario_id === 'NaN' || isNaN(usuario_id)) {
      throw new Error('usuario_id es obligatorio y debe ser un número válido');
    }

    // Convertir a número entero
    const usuarioIdNum = parseInt(usuario_id);
    if (isNaN(usuarioIdNum)) {
      throw new Error('usuario_id debe ser un número válido');
    }

    const fotografia = req.files?.['fotografia']?.[0]?.filename || null;

    // Insertar en tabla docentes
    const result = await client.query(
      `INSERT INTO docentes (
        usuario_id, nombres, apellidos, correo_electronico, ci,
        genero, grado_academico, titulo, anio_titulacion, universidad,
        experiencia_laboral, experiencia_docente, categoria_docente,
        modalidad_ingreso, fotografia
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      ) RETURNING id`,
      [
        usuarioIdNum, nombres, apellidos, correo_electronico, ci,
        genero, grado_academico, titulo, anio_titulacion, universidad,
        experiencia_laboral, experiencia_docente, categoria_docente,
        modalidad_ingreso, fotografia
      ]
    );

    const docenteId = result.rows[0]?.id;
    if (!docenteId) throw new Error('No se obtuvo ID del docente insertado');

    // 📚 Insertar asignaturas seleccionadas
    const asignaturaIds = JSON.parse(asignaturas || '[]');

    if (Array.isArray(asignaturaIds) && asignaturaIds.length > 0) {
      for (const asignaturaId of asignaturaIds) {
        await client.query(
          `INSERT INTO docente_asignatura (docente_id, asignatura_id)
           VALUES ($1, $2)`,
          [docenteId, asignaturaId]
        );
      }
    }

    // Procesar estudios (diplomados, maestrías, doctorados)
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
    res.status(200).json({ message: '✅ Docente, asignaturas y estudios guardados exitosamente.' });

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


// ✅ Obtener docente por usuario_id (para saber si ya llenó el formulario)
const obtenerDocentePorUsuarioId = async (req, res) => {
  const { usuarioId } = req.params; // <-- Esto obtiene el valor de la URL
  
  try {
    // ✅ VALIDACIÓN MEJORADA CON MANEJO DE CASOS EDGE
    console.log(`🔍 Recibido usuarioId: "${usuarioId}" (tipo: ${typeof usuarioId})`);
    
    // Verificar si usuarioId está vacío o es una cadena inválida
    if (!usuarioId || 
        usuarioId === 'undefined' || 
        usuarioId === 'null' || 
        usuarioId === 'NaN' ||
        usuarioId.trim() === '') {
      console.log('❌ usuarioId inválido:', usuarioId);
      return res.status(400).json({ 
        error: 'ID de usuario requerido',
        message: 'El parámetro usuarioId no puede estar vacío o ser inválido.',
        received: usuarioId
      });
    }

    // ✅ PARSEO SEGURO
    const usuarioIdNum = parseInt(usuarioId, 10); // <-- CLAVE: Intenta convertir la cadena a un número
    
    if (isNaN(usuarioIdNum) || usuarioIdNum <= 0) { // <-- CLAVE: Valida si la conversión falló
      console.log('❌ usuarioId no es un número válido:', usuarioId);
      return res.status(400).json({ 
        error: 'ID de usuario inválido',
        message: 'El usuarioId debe ser un número entero positivo',
        received: usuarioId
      });
    }

    console.log(`🔍 Buscando docente con usuario_id: ${usuarioIdNum}`);
    
    // ✅ La consulta se hace con un NÚMERO seguro
    const result = await pool.query('SELECT * FROM docentes WHERE usuario_id = $1', [usuarioIdNum]);
    
    if (result.rows.length > 0) {
      console.log('✅ Docente encontrado');
      res.status(200).json({ docente: result.rows[0] });
    } else {
      console.log('❌ No se encontró docente');
      res.status(404).json({ 
        message: 'No se encontró docente con ese usuario_id',
        usuario_id: usuarioIdNum
      });
    }
  } catch (error) {
    console.error('❌ Error al obtener docente:', error);
    res.status(500).json({ 
      error: 'Error al buscar docente por usuario_id', 
      detalle: error.message 
    });
  }
};

// Obtener docente por ID con estudios (admin)
const getDocentePorId = async (req, res) => {
  const { id } = req.params;

  try {
    // ✅ VALIDACIÓN MEJORADA
    const docenteIdNum = parseInt(id);
    if (isNaN(docenteIdNum)) {
      return res.status(400).json({ error: 'ID de docente inválido' });
    }

    const docenteResult = await pool.query('SELECT * FROM docentes WHERE id = $1', [docenteIdNum]);
    if (docenteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    const docente = docenteResult.rows[0];

    const estudiosResult = await pool.query(
      'SELECT * FROM estudios WHERE docente_id = $1 ORDER BY anio DESC',
      [docenteIdNum]
    );
    docente.estudios = estudiosResult.rows;

    const asignaturasResult = await pool.query(
      `SELECT a.id, a.nombre
       FROM asignaturas a
       JOIN docente_asignatura da ON a.id = da.asignatura_id
       WHERE da.docente_id = $1`,
      [docenteIdNum]
    );
    docente.asignaturas = asignaturasResult.rows;

    res.json(docente);
  } catch (error) {
    console.error('Error al obtener el docente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Obtener todos los docentes
const getTodosLosDocentes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM docentes ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener docentes:', error);
    res.status(500).json({ error: 'Error al obtener la lista de docentes' });
  }
};

// Actualizar datos del docente
const actualizarDocente = async (req, res) => {
  const client = await pool.connect();
  const docenteId = req.params.id;

  try {
    // ✅ VALIDACIÓN MEJORADA
    const docenteIdNum = parseInt(docenteId);
    if (isNaN(docenteIdNum)) {
      return res.status(400).json({ error: 'ID de docente inválido' });
    }

    console.log('✅ BODY:', req.body);
    console.log('📂 FILES:', req.files);

    await client.query('BEGIN');

    const {
      nombres, apellidos, correo_electronico, ci, genero,
      grado_academico, titulo, anio_titulacion, universidad,
      experiencia_laboral, experiencia_docente, categoria_docente,
      modalidad_ingreso, asignaturas
    } = req.body;

    const fotografia = req.files?.['fotografia']?.[0]?.filename || req.body.fotografia_actual || null;

    // Actualizar datos del docente
    await client.query(
      `UPDATE docentes SET
        nombres = $1, apellidos = $2, correo_electronico = $3,
        ci = $4, genero = $5, grado_academico = $6, titulo = $7,
        anio_titulacion = $8, universidad = $9,
        experiencia_laboral = $10, experiencia_docente = $11,
        categoria_docente = $12, modalidad_ingreso = $13,
        fotografia = $14
      WHERE id = $15`,
      [
        nombres, apellidos, correo_electronico, ci, genero,
        grado_academico, titulo, anio_titulacion, universidad,
        experiencia_laboral, experiencia_docente,
        categoria_docente, modalidad_ingreso,
        fotografia, docenteIdNum
      ]
    );

    // Actualizar asignaturas (limpiar y volver a insertar)
    const asignaturaIds = JSON.parse(asignaturas || '[]');
    await client.query(`DELETE FROM docente_asignatura WHERE docente_id = $1`, [docenteIdNum]);

    if (Array.isArray(asignaturaIds) && asignaturaIds.length > 0) {
      for (const asignaturaId of asignaturaIds) {
        await client.query(
          `INSERT INTO docente_asignatura (docente_id, asignatura_id)
           VALUES ($1, $2)`,
          [docenteIdNum, asignaturaId]
        );
      }
    }

    // Crear un mapa de archivos para acceder fácilmente
    const fileMap = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        fileMap[file.fieldname] = file;
      });
    }

    // Actualizar estudios (nuevos, modificados y eliminados)
    const estudios = [];

    const parseEstudios = (tipo, bodyField) => {
      const array = req.body[`estudios[${bodyField}]`] ? JSON.parse(req.body[`estudios[${bodyField}]`]) : [];
      array.forEach((item, i) => {
        estudios.push({
          id: item.id || null,
          tipo,
          universidad: item.universidad,
          anio: parseInt(item.anio),
          certificado: fileMap[`estudios[diplomados][${i}][certificado]`]?.filename
            || fileMap[`estudios[maestrias][${i}][certificado]`]?.filename
            || fileMap[`estudios[phds][${i}][certificado]`]?.filename || null,
          isNew: !item.id // Si no tiene ID, es nuevo
        });
      });
    };

    parseEstudios('diplomado', 'diplomados');
    parseEstudios('maestria', 'maestrias');
    parseEstudios('phd', 'phds');

    // Guardar estudios
    for (const est of estudios) {
      if (est.isNew) {
        await client.query(
          `INSERT INTO estudios (docente_id, tipo, universidad, anio, certificado)
           VALUES ($1, $2, $3, $4, $5)`,
          [docenteIdNum, est.tipo, est.universidad, est.anio, est.certificado]
        );
      } else {
        await client.query(
          `UPDATE estudios SET
            tipo = $1, universidad = $2, anio = $3, certificado = $4
           WHERE id = $5 AND docente_id = $6`,
          [est.tipo, est.universidad, est.anio, est.certificado, est.id, docenteIdNum]
        );
      }
    }

    // Eliminar estudios marcados para borrar
    ['diplomados', 'maestrias', 'phds'].forEach(async (tipo) => {
      const raw = req.body[`estudios_eliminar[${tipo}]`];
      if (raw) {
        const ids = JSON.parse(raw);
        if (Array.isArray(ids)) {
          for (const id of ids) {
            await client.query(`DELETE FROM estudios WHERE id = $1 AND docente_id = $2`, [id, docenteIdNum]);
          }
        }
      }
    });

    await client.query('COMMIT');

    // Respuesta final
    res.status(200).json({ message: '✅ Perfil actualizado correctamente', docente: { id: docenteIdNum } });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error al actualizar el perfil del docente',
      detalle: error.message
    });
  } finally {
    client.release();
  }
};

// Obtener estudios por docente_id
const obtenerEstudiosPorDocente = async (req, res) => {
  const { docente_id } = req.params;

  try {
    // ✅ VALIDACIÓN MEJORADA
    const docenteIdNum = parseInt(docente_id);
    if (isNaN(docenteIdNum)) {
      return res.status(400).json({ error: 'ID de docente inválido' });
    }

    const query = `
      SELECT id, tipo, universidad, anio, certificado
      FROM estudios
      WHERE docente_id = $1
      ORDER BY anio DESC
    `;
    const result = await pool.query(query, [docenteIdNum]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener estudios:', error);
    res.status(500).json({ error: 'Error al obtener estudios del docente' });
  }
};

// Exportación de todos los controladores
module.exports = {
  crearDocente,
  obtenerDocentePorUsuarioId,
  getDocentePorId,
  getTodosLosDocentes,
  actualizarDocente,
  obtenerEstudiosPorDocente
};