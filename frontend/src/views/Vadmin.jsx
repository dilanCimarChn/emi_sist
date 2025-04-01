import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificacionMenu from '../components/notifications/NotificacionMenu';
import './Vadmin.css';

const Vadmin = ({ actualizarRol }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('rol');
        actualizarRol(null);
        navigate('/', { replace: true });
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Panel de Administrador</h1>
                <div className="admin-actions">
                    <NotificacionMenu />
                    <button className="logout-button" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
            
            <div className="admin-content">
                <p>Bienvenido administrador, aquí puedes gestionar el sistema.</p>
                <p>Utiliza el icono de notificaciones para ver las solicitudes pendientes de acceso.</p>
            </div>
        </div>
    );
};

export default Vadmin;