import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormularioDocente from '../components/admin/FormularioDocente';
import ResumenDocente from './ResumenDocente';
import './Vdocente.css'; // Asegúrate de crear este archivo CSS

const Vdocente = ({ actualizarRol }) => {
  const navigate = useNavigate();
  const [docenteRegistrado, setDocenteRegistrado] = useState(null);
  const [refreshData, setRefreshData] = useState(0);
  const [docente, setDocente] = useState(null);
  
  const usuarioId = localStorage.getItem('usuario_id');
  
  const handleLogout = () => {
    localStorage.clear();
    actualizarRol(null);
    navigate('/', { replace: true });
  };
  
  const handleFormSuccess = () => {
    setRefreshData(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token || !usuarioId) {
          navigate('/', { replace: true });
          return;
        }
        
        const res = await axios.get(`http://localhost:5000/api/docentes/usuario/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.data?.docente) {
          setDocenteRegistrado(true);
          setDocente(res.data.docente);
        } else {
          setDocenteRegistrado(false);
        }
      } catch (error) {
        console.error('Error al verificar el estado del docente:', error);
        setDocenteRegistrado(false);
      }
    };
    
    if (usuarioId) {
      fetchDocente();
    } else {
      navigate('/', { replace: true });
    }
  }, [usuarioId, navigate, refreshData]);

  if (docenteRegistrado === null) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del docente...</p>
      </div>
    );
  }

  return (
    <div className="docente-container">
      <header className="docente-header">
        <div className="user-info">
          {docente && (
            <div className="user-welcome">
              <span className="user-name">{docente.nombres} {docente.apellidos}</span>
            </div>
          )}
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Cerrar sesión
        </button>
      </header>

      <main className="docente-content">
        {docenteRegistrado ? (
          <ResumenDocente usuarioId={usuarioId} />
        ) : (
          <div className="form-container">
            <div className="form-header">
              <h2>Registro de información docente</h2>
              <p>Complete el siguiente formulario para registrar sus datos en el sistema.</p>
            </div>
            <FormularioDocente onFormSuccess={handleFormSuccess} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Vdocente;