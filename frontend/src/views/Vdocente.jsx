import React from 'react';
import { useNavigate } from 'react-router-dom';

const Vdocente = ({ actualizarRol }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    actualizarRol(null);
    navigate('/', { replace: true });
  };

  return (
    <div>
      <h1>Panel del Docente</h1>
      <p>Bienvenido docente, aquí podrás gestionar tus actividades académicas.</p>
      
      <button onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Vdocente;
