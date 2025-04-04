// src/components/admin/DetalleDocente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DetalleDocente.css';

const DetalleDocente = ({ docente }) => {
  const navigate = useNavigate();

  if (!docente) return null;

  return (
    <div className="detalle-docente-container">
      <h2>Detalle del Docente</h2>
      <div className="info-grid">
        <p><strong>Nombre:</strong> {docente.nombres} {docente.apellidos}</p>
        <p><strong>Correo:</strong> {docente.correo_electronico}</p>
        <p><strong>CI:</strong> {docente.ci}</p>
        <p><strong>Grado Académico:</strong> {docente.grado_academico}</p>
        <p><strong>Título:</strong> {docente.titulo}</p>
        <p><strong>Universidad:</strong> {docente.universidad}</p>
        <p><strong>Año Titulación:</strong> {docente.anio_titulacion}</p>
        <p><strong>Asignaturas:</strong> {docente.asignaturas}</p>

        {docente.fotografia && (
          <img
            src={`http://localhost:5000/uploads/${docente.fotografia}`}
            alt="Fotografía"
            className="docente-foto"
          />
        )}
      </div>

      <button
        className="btn-editar-detalle"
        onClick={() => navigate(`/admin/docentes/editar/${docente.id}`)}
      >
        Editar información
      </button>
    </div>
  );
};

export default DetalleDocente;
