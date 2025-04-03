import React from 'react';
import './DetalleDocente.css';

const DetalleDocente = ({ docente }) => {
  return (
    <div className="detalle-docente">
      <div className="detalle-header">
        <div className="docente-foto">
          {docente.fotografia ? (
            <img 
              src={`http://localhost:5000/uploads/fotosDocentes/${docente.fotografia}`} 
              alt={`${docente.nombres} ${docente.apellidos}`} 
            />
          ) : (
            <div className="foto-placeholder">
              {docente.nombres.charAt(0)}{docente.apellidos.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="docente-titulo">
          <h2>{docente.nombres} {docente.apellidos}</h2>
          <p>{docente.correo_electronico}</p>
          <p>CI: {docente.ci}</p>
        </div>
        
        <div className="docente-acciones">
          <button className="btn-asignar-horario">
            Asignar Horarios
          </button>
        </div>
      </div>
      
      <div className="detalle-body">
        <div className="detalle-section">
          <h3>Datos Personales</h3>
          <div className="detalle-grid">
            <div className="detalle-item">
              <span className="detalle-label">Género:</span>
              <span className="detalle-value">
                {docente.genero === 'masculino' ? 'Masculino' : 
                 docente.genero === 'femenino' ? 'Femenino' : 
                 docente.genero === 'otro' ? 'Otro' : 'No especificado'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="detalle-section">
          <h3>Formación Académica</h3>
          <div className="detalle-grid">
            <div className="detalle-item">
              <span className="detalle-label">Grado Académico:</span>
              <span className="detalle-value">{docente.grado_academico}</span>
            </div>
            
            <div className="detalle-item">
              <span className="detalle-label">Título:</span>
              <span className="detalle-value">{docente.titulo}</span>
            </div>
            
            <div className="detalle-item">
              <span className="detalle-label">Año de Titulación:</span>
              <span className="detalle-value">{docente.anio_titulacion}</span>
            </div>
            
            <div className="detalle-item">
              <span className="detalle-label">Universidad:</span>
              <span className="detalle-value">{docente.universidad}</span>
            </div>
          </div>
          
          {docente.diplomado_competencias && (
            <div className="detalle-subsection">
              <h4>Diplomado en Competencias</h4>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Año:</span>
                  <span className="detalle-value">{docente.dipl_comp_ano}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Universidad:</span>
                  <span className="detalle-value">{docente.dipl_comp_univ}</span>
                </div>
              </div>
            </div>
          )}
          
          {docente.maestria && (
            <div className="detalle-subsection">
              <h4>Maestría</h4>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Año:</span>
                  <span className="detalle-value">{docente.msc_ano}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Universidad:</span>
                  <span className="detalle-value">{docente.msc_univ}</span>
                </div>
              </div>
            </div>
          )}
          
          {docente.phd && (
            <div className="detalle-subsection">
              <h4>Doctorado (PhD)</h4>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Año:</span>
                  <span className="detalle-value">{docente.phd_ano}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Universidad:</span>
                  <span className="detalle-value">{docente.phd_univ}</span>
                </div>
              </div>
            </div>
          )}
          
          {docente.pos_phd && (
            <div className="detalle-subsection">
              <h4>Post-Doctorado</h4>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Año:</span>
                  <span className="detalle-value">{docente.pos_phd_ano}</span>
                </div>
                
                <div className="detalle-item">
                  <span className="detalle-label">Universidad:</span>
                  <span className="detalle-value">{docente.pos_phd_univ}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="detalle-section">
          <h3>Experiencia</h3>
          <div className="detalle-grid">
            <div className="detalle-item">
              <span className="detalle-label">Experiencia Laboral:</span>
              <span className="detalle-value">{docente.experiencia_laboral} años</span>
            </div>
            
            <div className="detalle-item">
              <span className="detalle-label">Experiencia Docente:</span>
              <span className="detalle-value">{docente.experiencia_docente} años</span>
            </div>
            
            <div className="detalle-item">
              <span className="detalle-label">Categoría Docente:</span>
              <span className="detalle-value">{docente.categoria_docente}</span>
            </div>
            
            <div className="detalle-item">
              <span className="detalle-label">Modalidad de Ingreso:</span>
              <span className="detalle-value">{docente.modalidad_ingreso}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleDocente;