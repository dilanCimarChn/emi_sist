// src/pages/DetalleDocente.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DetalleDocente.css';

const DetalleDocente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/docentes/${id}`);
        setDocente(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del docente');
        setLoading(false);
        console.error('❌ Error al obtener el docente:', err);
      }
    };

    fetchDocente();
  }, [id]);

  const handleVolver = () => {
    navigate('/admin');
  };

  if (loading) return <div className="loading">Cargando datos del docente...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!docente) return <div className="error">No se encontró información del docente</div>;

  return (
    <div className="detalle-docente-container">
      <div className="detalle-header">
        <button className="btn-volver" onClick={handleVolver}>← Volver</button>
        <h1>Detalle del Docente</h1>
      </div>

      <div className="detalle-content">
        <div className="card info-personal">
          <h2>Información Personal</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Nombre:</span>
              <span className="value">{docente.nombres} {docente.apellidos}</span>
            </div>
            <div className="info-item">
              <span className="label">Correo:</span>
              <span className="value">{docente.correo_electronico}</span>
            </div>
            <div className="info-item">
              <span className="label">CI:</span>
              <span className="value">{docente.ci}</span>
            </div>
            <div className="info-item">
              <span className="label">Género:</span>
              <span className="value">{docente.genero}</span>
            </div>
            <div className="info-item">
              <span className="label">Grado Académico:</span>
              <span className="value">{docente.grado_academico}</span>
            </div>
            <div className="info-item">
              <span className="label">Título:</span>
              <span className="value">{docente.titulo}</span>
            </div>
            <div className="info-item">
              <span className="label">Año de Titulación:</span>
              <span className="value">{docente.anio_titulacion}</span>
            </div>
            <div className="info-item">
              <span className="label">Universidad:</span>
              <span className="value">{docente.universidad}</span>
            </div>
            <div className="info-item">
              <span className="label">Experiencia Laboral:</span>
              <span className="value">{docente.experiencia_laboral} años</span>
            </div>
            <div className="info-item">
              <span className="label">Experiencia Docente:</span>
              <span className="value">{docente.experiencia_docente} años</span>
            </div>
            <div className="info-item">
              <span className="label">Categoría:</span>
              <span className="value">{docente.categoria_docente}</span>
            </div>
            <div className="info-item">
              <span className="label">Modalidad de Ingreso:</span>
              <span className="value">{docente.modalidad_ingreso}</span>
            </div>
            <div className="info-item">
              <span className="label">Asignaturas:</span>
              <span className="value">{docente.asignaturas}</span>
            </div>
          </div>
        </div>

        {/* Foto si existe */}
        {docente.fotografia && (
          <div className="card">
            <h2>Fotografía</h2>
            <img
              src={`http://localhost:5000/uploads/${docente.fotografia}`}
              alt="Fotografía del docente"
              className="foto-docente"
            />
          </div>
        )}

        {/* Estudios complementarios */}
        {docente.estudios && docente.estudios.length > 0 && (
          <div className="card">
            <h2>Estudios Complementarios</h2>
            <div className="info-grid">
              {docente.estudios.map((est, index) => (
                <div key={index} className="info-item">
                  <span className="label">Tipo:</span>
                  <span className="value">{est.tipo}</span><br />
                  <span className="label">Universidad:</span>
                  <span className="value">{est.universidad}</span><br />
                  <span className="label">Año:</span>
                  <span className="value">{est.anio}</span><br />
                  {est.certificado && (
                    <a
                      href={`http://localhost:5000/uploads/${est.certificado}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-link"
                    >
                      Ver certificado
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleDocente;
