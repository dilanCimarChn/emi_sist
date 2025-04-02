const pool = require('../db');

// Obtener todos los docentes (versión simplificada para listado)
exports.getDocentes = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT d.id, u.nombre, u.apellidos, u.correo, d.fotografia FROM docentes d JOIN usuarios u ON d.usuario_id = u.id'
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        res.status(500).json({
            message: "Error al obtener la lista de docentes",
            error: true
        });
    }
};

// Obtener datos completos de un docente específico
exports.getDocenteById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            `SELECT d.*, u.nombre, u.apellidos, u.correo 
             FROM docentes d 
             JOIN usuarios u ON d.usuario_id = u.id 
             WHERE d.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Docente no encontrado",
                error: true
            });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener docente:', error);
        res.status(500).json({
            message: "Error al obtener datos del docente",
            error: true
        });
    }
};

// Actualizar datos del docente
exports.updateDocente = async (req, res) => {
    const { id } = req.params;
    const { 
        nombres, apellidos, correo_electronico, fotografia, ci, genero, 
        grado_academico, titulo, anio_titulacion, universidad,
        diplomado_competencias, dipl_comp_ano, dipl_comp_univ,
        maestria, msc_ano, msc_univ,
        phd, phd_univ, phd_ano,
        pos_phd, pos_phd_univ, pos_phd_ano,
        experiencia_laboral, experiencia_docente,
        categoria_docente, modalidad_ingreso
    } = req.body;
    
    try {
        // Iniciar transacción
        await pool.query('BEGIN');
        
        // Actualizar datos básicos en tabla usuarios
        await pool.query(
            'UPDATE usuarios SET nombre = $1, apellidos = $2, correo = $3 WHERE id = (SELECT usuario_id FROM docentes WHERE id = $4)',
            [nombres, apellidos, correo_electronico, id]
        );
        
        // Actualizar datos completos en tabla docentes
        await pool.query(
            `UPDATE docentes SET 
                nombres = $1, 
                apellidos = $2, 
                correo_electronico = $3, 
                fotografia = $4, 
                ci = $5, 
                genero = $6, 
                grado_academico = $7, 
                titulo = $8, 
                anio_titulacion = $9, 
                universidad = $10,
                diplomado_competencias = $11, 
                dipl_comp_ano = $12, 
                dipl_comp_univ = $13,
                maestria = $14, 
                msc_ano = $15, 
                msc_univ = $16,
                phd = $17, 
                phd_univ = $18, 
                phd_ano = $19,
                pos_phd = $20, 
                pos_phd_univ = $21, 
                pos_phd_ano = $22,
                experiencia_laboral = $23, 
                experiencia_docente = $24,
                categoria_docente = $25, 
                modalidad_ingreso = $26
             WHERE id = $27`,
            [
                nombres, apellidos, correo_electronico, fotografia, ci, genero, 
                grado_academico, titulo, anio_titulacion, universidad,
                diplomado_competencias, dipl_comp_ano, dipl_comp_univ,
                maestria, msc_ano, msc_univ,
                phd, phd_univ, phd_ano,
                pos_phd, pos_phd_univ, pos_phd_ano,
                experiencia_laboral, experiencia_docente,
                categoria_docente, modalidad_ingreso,
                id
            ]
        );
        
        // Confirmar transacción
        await pool.query('COMMIT');
        
        res.json({
            message: "Datos del docente actualizados correctamente",
            id
        });
    } catch (error) {
        // Revertir cambios si hay error
        await pool.query('ROLLBACK');
        console.error('Error al actualizar docente:', error);
        res.status(500).json({
            message: "Error al actualizar datos del docente",
            error: true
        });
    }
};

// Subir fotografía del docente
exports.uploadFoto = async (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({
            message: "No se ha proporcionado ninguna imagen",
            error: true
        });
    }
    
    try {
        // Guardar el nombre del archivo en la base de datos
        await pool.query(
            'UPDATE docentes SET fotografia = $1 WHERE id = $2',
            [req.file.filename, id]
        );
        
        res.json({
            message: "Fotografía actualizada correctamente",
            foto: req.file.filename
        });
    } catch (error) {
        console.error('Error al subir fotografía:', error);
        res.status(500).json({
            message: "Error al actualizar la fotografía",
            error: true
        });
    }
};