import React from 'react';
import { useNavigate } from 'react-router-dom';

const Vadmin = ({ actualizarRol }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    actualizarRol(null); 
    navigate('/', { replace: true });
  };

  return (
    <div>
      <h1>Panel de Administrador</h1>
      <p>Bienvenido administrador, aquí puedes gestionar el sistema.</p>
      
      <button onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Vadmin;
