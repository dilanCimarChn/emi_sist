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
        const res = await axios.get(`http://localhost:5000/api/docentes/usuario/${usuario_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.docente) {
          setDocente(res.data.docente);
        } else {
          navigate('/formulario'); // Si no tiene datos, lo mandamos a llenar
        }
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
      <p><strong>Asignaturas:</strong> {docente.asignaturas}</p>

      {docente.fotografia && (
        <div>
          <strong>Fotografía:</strong><br />
          <img
            src={`/uploads/${docente.fotografia}`}
            alt="Foto del docente"
          />

        </div>
      )}
    </div>
  );
};

export default ResumenDocente;
