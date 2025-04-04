// src/pages/Vadmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificacionMenu from '../components/notifications/NotificacionMenu';
import ListaDocentes from '../components/admin/ListaDocentes';
import DetalleDocente from '../components/admin/DetalleDocente';
import './Vadmin.css';

const Vadmin = ({ actualizarRol }) => {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState(null);
  const [loadingDocentes, setLoadingDocentes] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/docentes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDocentes(response.data);
        setLoadingDocentes(false);
      } catch (err) {
        console.error('❌ Error al obtener docentes:', err);
        setError('No se pudieron cargar los docentes');
        setLoadingDocentes(false);
      }
    };
    fetchDocentes();
  }, []);

  const handleDocenteClick = async (docenteId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5000/api/docentes/${docenteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDocenteSeleccionado(response.data); // 👈 depende de tu backend
    } catch (err) {
      console.error('❌ Error al obtener detalle del docente:', err);
      setError('No se pudieron cargar los detalles del docente');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    actualizarRol(null);
    navigate('/');
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Administrador</h1>
        <div className="admin-actions">
          <NotificacionMenu />
          <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-layout">
          <div className="admin-sidebar">
            <h2>Docentes</h2>
            {loadingDocentes ? (
              <p>Cargando lista de docentes...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <ListaDocentes
                docentes={docentes}
                onDocenteClick={handleDocenteClick}
                docenteSeleccionadoId={docenteSeleccionado?.id}
              />
            )}
          </div>

          <div className="admin-main-content">
            {docenteSeleccionado ? (
              <DetalleDocente docente={docenteSeleccionado} />
            ) : (
              <div className="admin-placeholder">
                <p>Seleccione un docente para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vadmin;
