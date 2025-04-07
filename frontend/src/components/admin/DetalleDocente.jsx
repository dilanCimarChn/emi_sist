import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DetalleDocente.css';

const DetalleDocente = ({ docente }) => {
  const navigate = useNavigate();
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [estudios, setEstudios] = useState([]);

  useEffect(() => {
    const obtenerEstudios = async () => {
      if (docente && mostrarDetalles) {
        try {
          const response = await fetch(`/api/docentes/estudios/${docente.id}`);
          const data = await response.json();
          setEstudios(data);
        } catch (error) {
          console.error('Error al obtener los estudios:', error);
        }
      }
    };

    obtenerEstudios();
  }, [docente, mostrarDetalles]);

  if (!docente) return null;

  return (
    <div className="detalle-docente-container">
      <div className="card">
        <div className="header-con-foto">
          <div className="info-docente">
            <h2 className="tab-header">Detalle del Docente</h2>
            <div className="info-grid">
              <p><strong>Nombre:</strong> {docente.nombres} {docente.apellidos}</p>
              <p><strong>Correo:</strong> {docente.correo_electronico}</p>
              <p><strong>CI:</strong> {docente.ci}</p>
              <p><strong>Grado Académico:</strong> {docente.grado_academico}</p>
              <p><strong>Título:</strong> {docente.titulo}</p>
              <p><strong>Universidad:</strong> {docente.universidad}</p>
              <p><strong>Año Titulación:</strong> {docente.anio_titulacion}</p>
              <p>
                <strong>Asignaturas:</strong>{' '}
                {docente.asignaturas?.length > 0
                  ? docente.asignaturas.map((asig, i) => (
                      <span key={asig.id}>
                        {asig.nombre}{i < docente.asignaturas.length - 1 ? ', ' : ''}
                      </span>
                    ))
                  : 'No hay asignaturas registradas'}
              </p>
            </div>
          </div>
  
          {docente.fotografia && (
            <div className="foto-perfil-container">
              <img
                src={`/uploads/${docente.fotografia}`}
                alt="Foto del docente"
                className="docente-foto-grande"
              />
            </div>
          )}
        </div>
  
        <div className="action-buttons-container">
          <button
            className="btn-editar"
            onClick={() => navigate(`/admin/docentes/editar/${docente.id}`)}
          >
            Editar información
          </button>
  
          <button
            className="btn-ver-detalles"
            onClick={() => setMostrarDetalles(!mostrarDetalles)}
          >
            {mostrarDetalles ? 'Ocultar detalles' : 'Más detalles'}
          </button>
        </div>
  
        {mostrarDetalles && (
          <div className="card estudios-docente">
            <h3 className="tab-header">Estudios Adicionales</h3>
            {estudios.length > 0 ? (
              <ul>
                {estudios.map((estudio) => (
                  <li key={estudio.id} className="estudio-item">
                    <p><strong>Tipo:</strong> {estudio.tipo}</p>
                    <p><strong>Universidad:</strong> {estudio.universidad}</p>
                    <p><strong>Año:</strong> {estudio.anio}</p>
                    <p>
                      <strong>Certificado:</strong>{' '}
                      <a
                        href={`/uploads/${estudio.certificado}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver certificado
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se encontraron estudios adicionales.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  
};

export default DetalleDocente;
