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
  const [cambioEstado, setCambioEstado] = useState(false);

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const response = await axios.get(`/api/docentes/${id}`);
        setDocente(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos del docente');
        setLoading(false);
        console.error('Error al obtener el docente:', err);
      }
    };

    fetchDocente();
  }, [id, cambioEstado]);

  const handleCambioEstado = async (nuevoEstado) => {
    try {
      await axios.patch(`/api/docentes/${id}/estado`, { estado: nuevoEstado });
      setCambioEstado(!cambioEstado);
      alert(`Estado del docente actualizado a: ${nuevoEstado}`);
    } catch (err) {
      alert('Error al actualizar el estado del docente');
      console.error('Error al actualizar el estado:', err);
    }
  };

  const handleVolver = () => {
    navigate('/admin/docentes');
  };

  if (loading) return <div className="loading-container">Cargando datos del docente...</div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!docente) return <div className="error-container">No se encontró información del docente</div>;

  return (
    <div className="detalle-docente-container">
      <div className="detalle-header">
        <button className="btn-volver" onClick={handleVolver}>
          ← Volver a la lista
        </button>
        <h1>Detalle del Docente</h1>
      </div>

      <div className="detalle-content">
        <div className="card info-personal">
          <h2>Información Personal</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Nombre:</span>
              <span className="value">{docente.nombre} {docente.apellido}</span>
            </div>
            <div className="info-item">
              <span className="label">Correo:</span>
              <span className="value">{docente.correo}</span>
            </div>
            <div className="info-item">
              <span className="label">Teléfono:</span>
              <span className="value">{docente.telefono || 'No especificado'}</span>
            </div>
            <div className="info-item">
              <span className="label">Departamento:</span>
              <span className="value">{docente.departamento}</span>
            </div>
            <div className="info-item">
              <span className="label">Estado:</span>
              <span className={`status ${docente.estado?.toLowerCase()}`}>
                {docente.estado || 'Pendiente'}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Fecha de registro:</span>
              <span className="value">
                {new Date(docente.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {docente.formacion && (
          <div className="card">
            <h2>Formación Académica</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Nivel de estudios:</span>
                <span className="value">{docente.formacion.nivelEstudios}</span>
              </div>
              <div className="info-item">
                <span className="label">Título:</span>
                <span className="value">{docente.formacion.titulo}</span>
              </div>
              <div className="info-item">
                <span className="label">Institución:</span>
                <span className="value">{docente.formacion.institucion}</span>
              </div>
              <div className="info-item">
                <span className="label">Año de graduación:</span>
                <span className="value">{docente.formacion.anoGraduacion}</span>
              </div>
            </div>
          </div>
        )}

        {docente.experiencia && (
          <div className="card">
            <h2>Experiencia Docente</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Años de experiencia:</span>
                <span className="value">{docente.experiencia.anosExperiencia}</span>
              </div>
              <div className="info-item">
                <span className="label">Asignaturas:</span>
                <span className="value">{docente.experiencia.asignaturas?.join(', ')}</span>
              </div>
              <div className="info-item">
                <span className="label">Nivel educativo:</span>
                <span className="value">{docente.experiencia.nivelEducativo}</span>
              </div>
            </div>
          </div>
        )}

        {docente.documentos && docente.documentos.length > 0 && (
          <div className="card">
            <h2>Documentos</h2>
            <ul className="documentos-list">
              {docente.documentos.map((doc, index) => (
                <li key={index}>
                  <span className="doc-name">{doc.nombre}</span>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link">
                    Ver documento
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card actions">
          <h2>Acciones</h2>
          <div className="action-buttons-container">
            <button
              className="btn-estado aprobar"
              onClick={() => handleCambioEstado('Activo')}
              disabled={docente.estado === 'Activo'}
            >
              Aprobar
            </button>
            <button
              className="btn-estado rechazar"
              onClick={() => handleCambioEstado('Inactivo')}
              disabled={docente.estado === 'Inactivo'}
            >
              Rechazar
            </button>
            <button
              className="btn-estado pendiente"
              onClick={() => handleCambioEstado('Pendiente')}
              disabled={docente.estado === 'Pendiente'}
            >
              Marcar como pendiente
            </button>
            <button 
              className="btn-editar"
              onClick={() => navigate(`/admin/docentes/editar/${id}`)}
            >
              Editar información
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleDocente;