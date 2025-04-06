import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResumenDocente = () => {
  const [docente, setDocente] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario_id = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('authToken');

    if (!usuario_id || !token) {
      return navigate('/');
    }

    const fetchDatos = async () => {
      try {
        // 🔁 Primero obtenemos el ID real del docente
        const resUsuario = await axios.get(`http://localhost:5000/api/docentes/usuario/${usuario_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const docenteData = resUsuario.data?.docente;
        if (!docenteData?.id) {
          return navigate('/formulario');
        }

        // 🔁 Luego obtenemos los datos completos por ID (con asignaturas y estudios)
        const res = await axios.get(`http://localhost:5000/api/docentes/${docenteData.id}`);
        setDocente(res.data);
      } catch (error) {
        console.error('❌ Error al obtener datos del docente:', error);
        navigate('/');
      }
    };

    fetchDatos();
  }, [navigate]);

  if (!docente) return <p>Cargando datos del docente...</p>;

  return (
    <div className="resumen-docente">
      <h2>Perfil del Docente</h2>
      <p><strong>Nombres:</strong> {docente.nombres}</p>
      <p><strong>Apellidos:</strong> {docente.apellidos}</p>
      <p><strong>CI:</strong> {docente.ci}</p>
      <p><strong>Correo:</strong> {docente.correo_electronico}</p>
      <p><strong>Género:</strong> {docente.genero}</p>
      <p><strong>Grado Académico:</strong> {docente.grado_academico}</p>
      <p><strong>Título:</strong> {docente.titulo}</p>
      <p><strong>Año de Titulación:</strong> {docente.anio_titulacion}</p>
      <p><strong>Universidad:</strong> {docente.universidad}</p>
      <p><strong>Experiencia Laboral:</strong> {docente.experiencia_laboral} años</p>
      <p><strong>Experiencia Docente:</strong> {docente.experiencia_docente} años</p>
      <p><strong>Categoría Docente:</strong> {docente.categoria_docente}</p>
      <p><strong>Modalidad de Ingreso:</strong> {docente.modalidad_ingreso}</p>

      <div>
        <strong>Asignaturas que dicta:</strong>
        <ul>
          {docente.asignaturas?.map(asig => (
            <li key={asig.id}>{asig.nombre}</li>
          ))}
        </ul>
      </div>

      {docente.estudios?.length > 0 && (
        <div>
          <h3>Estudios Adicionales</h3>
          <ul>
            {docente.estudios.map((est, i) => (
              <li key={i}>
                {est.tipo.toUpperCase()} en {est.universidad} ({est.anio}){' '}
                {est.certificado && (
                  <a href={`/uploads/${est.certificado}`} target="_blank" rel="noopener noreferrer">
                    [Certificado]
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {docente.fotografia && (
        <div>
          <strong>Fotografía:</strong><br />
          <img
            src={`/uploads/${docente.fotografia}`}
            alt="Foto del docente"
            style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '10px' }}
          />
        </div>
      )}
    </div>
  );
};

export default ResumenDocente;
