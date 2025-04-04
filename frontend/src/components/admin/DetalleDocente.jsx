// src/components/admin/DetalleDocente.jsx
import React from 'react';
import './DetalleDocente.css';

const DetalleDocente = ({ docente }) => {
  if (!docente) return <p>No hay docente seleccionado.</p>;

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

      {docente.estudios?.length > 0 && (
        <div>
          <h3>Estudios Complementarios</h3>
          {docente.estudios.map((est, i) => (
            <div key={i} className="estudio-item">
              <p><strong>Tipo:</strong> {est.tipo}</p>
              <p><strong>Universidad:</strong> {est.universidad}</p>
              <p><strong>Año:</strong> {est.anio}</p>
              {est.certificado && (
                <a
                  href={`http://localhost:5000/uploads/${est.certificado}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver certificado
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetalleDocente;
