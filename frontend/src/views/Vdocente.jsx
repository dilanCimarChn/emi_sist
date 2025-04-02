import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Vdocente.css';
import PerfilDocente from '../components/docente/PerfilDocente';
import IconoEditar from '../components/ui/IconoEditar';

const Vdocente = ({ actualizarRol }) => {
  const navigate = useNavigate();
  const [docenteData, setDocenteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Obtener ID del docente del localStorage o de donde lo tengas almacenado
  const usuarioId = localStorage.getItem('usuarioId');

  useEffect(() => {
    const fetchDocenteData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/docentes/${usuarioId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setDocenteData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos del docente:', err);
        setError('No se pudieron cargar los datos del docente');
        setLoading(false);
      }
    };

    fetchDocenteData();
  }, [usuarioId]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuarioId');
    actualizarRol(null);
    navigate('/', { replace: true });
  };

  const handleToggleEdicion = () => {
    setModoEdicion(!modoEdicion);
  };

  if (loading) {
    return <div className="loading-container">Cargando datos...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="docente-container">
      <div className="docente-header">
        <h1>Panel del Docente</h1>
        <div className="docente-actions">
          <IconoEditar onClick={handleToggleEdicion} />
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="docente-content">
        <PerfilDocente 
          docente={docenteData} 
          modoEdicion={modoEdicion} 
          setModoEdicion={setModoEdicion}
          onUpdate={(updatedData) => setDocenteData(updatedData)}
        />
      </div>
    </div>
  );
};

export default Vdocente;