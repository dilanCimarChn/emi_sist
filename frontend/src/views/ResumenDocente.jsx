import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumenDocente.css';

const ResumenDocente = () => {
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [certificadoPreview, setCertificadoPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario_id = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('authToken');

    if (!usuario_id || !token) {
      return navigate('/');
    }

    const fetchDatos = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePreviewCertificado = (url) => {
    setCertificadoPreview(url);
  };

  const closePreview = () => {
    setCertificadoPreview(null);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando perfil docente...</p>
      </div>
    );
  }

  if (!docente) return null;

  return (
    <div className="resumen-docente">
      <div className="perfil-header">
        <div className="perfil-titulo">
          <h1>Perfil Académico</h1>
          <p className="subtitle">Información completa del docente</p>
        </div>
        {docente.fotografia && (
          <div className="perfil-foto-container">
            <img
              src={`http://localhost:5000/uploads/${docente.fotografia}`}
              alt={`${docente.nombres} ${docente.apellidos}`}
              className="perfil-foto"
            />
          </div>
        )}
      </div>

      <div className="nombre-docente">
        <h2>{docente.nombres} {docente.apellidos}</h2>
        <span className="badge">{docente.grado_academico}</span>
      </div>

      <div className="perfil-tabs">
        <button 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => handleTabChange('personal')}
        >
          Información Personal
        </button>
        <button 
          className={`tab-btn ${activeTab === 'academica' ? 'active' : ''}`}
          onClick={() => handleTabChange('academica')}
        >
          Formación Académica
        </button>
        <button 
          className={`tab-btn ${activeTab === 'experiencia' ? 'active' : ''}`}
          onClick={() => handleTabChange('experiencia')}
        >
          Experiencia Profesional
        </button>
      </div>

      <div className="perfil-content">
        {/* Tab de información personal */}
        <div className={`tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
          <div className="info-card">
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Nombres</span>
                <span className="info-value">{docente.nombres}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Apellidos</span>
                <span className="info-value">{docente.apellidos}</span>
              </div>
            </div>
            
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">CI</span>
                <span className="info-value">{docente.ci}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Género</span>
                <span className="info-value">{docente.genero}</span>
              </div>
            </div>
            
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Correo Electrónico</span>
                <span className="info-value">{docente.correo_electronico}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab de formación académica */}
        <div className={`tab-content ${activeTab === 'academica' ? 'active' : ''}`}>
          <div className="info-card">
            <h3>Formación Principal</h3>
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Grado Académico</span>
                <span className="info-value">{docente.grado_academico}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Título</span>
                <span className="info-value">{docente.titulo}</span>
              </div>
            </div>
            
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Año de Titulación</span>
                <span className="info-value">{docente.anio_titulacion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Universidad</span>
                <span className="info-value">{docente.universidad}</span>
              </div>
            </div>
          </div>

          {/* Diplomados */}
          {docente.diplomados && docente.diplomados.length > 0 && (
            <div className="info-card">
              <h3>Diplomados</h3>
              <div className="certificados-grid">
                {docente.diplomados.map((item, index) => (
                  <div className="certificado-item" key={`diplomado-${index}`}>
                    <div className="certificado-info">
                      <h4>{item.universidad}</h4>
                      <p>Año: {item.anio}</p>
                    </div>
                    {item.certificado && (
                      <button 
                        className="btn-preview" 
                        onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                      >
                        Ver certificado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maestrías */}
          {docente.maestrias && docente.maestrias.length > 0 && (
            <div className="info-card">
              <h3>Maestrías</h3>
              <div className="certificados-grid">
                {docente.maestrias.map((item, index) => (
                  <div className="certificado-item" key={`maestria-${index}`}>
                    <div className="certificado-info">
                      <h4>{item.universidad}</h4>
                      <p>Año: {item.anio}</p>
                    </div>
                    {item.certificado && (
                      <button 
                        className="btn-preview" 
                        onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                      >
                        Ver certificado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doctorados */}
          {docente.phds && docente.phds.length > 0 && (
            <div className="info-card">
              <h3>Doctorados (PhD)</h3>
              <div className="certificados-grid">
                {docente.phds.map((item, index) => (
                  <div className="certificado-item" key={`phd-${index}`}>
                    <div className="certificado-info">
                      <h4>{item.universidad}</h4>
                      <p>Año: {item.anio}</p>
                    </div>
                    {item.certificado && (
                      <button 
                        className="btn-preview" 
                        onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                      >
                        Ver certificado
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab de experiencia profesional */}
        <div className={`tab-content ${activeTab === 'experiencia' ? 'active' : ''}`}>
          <div className="info-card">
            <h3>Experiencia</h3>
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Experiencia Laboral</span>
                <span className="info-value">{docente.experiencia_laboral} años</span>
              </div>
              <div className="info-item">
                <span className="info-label">Experiencia Docente</span>
                <span className="info-value">{docente.experiencia_docente} años</span>
              </div>
            </div>
            
            <div className="info-row">
              <div className="info-item">
                <span className="info-label">Categoría Docente</span>
                <span className="info-value">{docente.categoria_docente}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Modalidad de Ingreso</span>
                <span className="info-value">{docente.modalidad_ingreso}</span>
              </div>
            </div>
          </div>

          {docente.asignaturas && (
            <div className="info-card">
              <h3>Asignaturas</h3>
              <div className="asignaturas-container">
                {docente.asignaturas.split('\n').map((asignatura, index) => (
                  asignatura.trim() && (
                    <div className="asignatura-chip" key={index}>
                      {asignatura.trim()}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para previsualizar certificados */}
      {certificadoPreview && (
        <div className="certificado-modal">
          <div className="certificado-modal-content">
            <button className="close-modal" onClick={closePreview}>×</button>
            <div className="certificado-preview">
              <img src={certificadoPreview} alt="Certificado" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenDocente;