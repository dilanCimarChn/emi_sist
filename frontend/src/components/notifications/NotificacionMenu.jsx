import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './NotificacionMenu.css';

const NotificacionMenu = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const menuRef = useRef(null);

    const fetchSolicitudes = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/admin/solicitudes', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSolicitudes(response.data);
        } catch (error) {
            console.error('Error al obtener solicitudes:', error);
            setError('No se pudieron cargar las solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Obtener solicitudes al cargar el componente
        fetchSolicitudes();

        // Configurar intervalo para verificar nuevas solicitudes
        const interval = setInterval(fetchSolicitudes, 30000); // cada 30 segundos
        
        // Configurar detector de clics fuera del menú
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleApprobarSolicitud = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:5000/api/admin/solicitudes/${id}/aprobar`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Actualizar la lista de solicitudes
            fetchSolicitudes();
        } catch (error) {
            console.error('Error al aprobar solicitud:', error);
            alert('Error al aprobar la solicitud');
        }
    };

    const handleRechazarSolicitud = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:5000/api/admin/solicitudes/${id}/rechazar`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Actualizar la lista de solicitudes
            fetchSolicitudes();
        } catch (error) {
            console.error('Error al rechazar solicitud:', error);
            alert('Error al rechazar la solicitud');
        }
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="notificacion-container" ref={menuRef}>
            <button 
                className="notificacion-icono" 
                onClick={toggleMenu}
            >
                <span className="icono-campana">🔔</span>
                {solicitudes.length > 0 && (
                    <span className="notificacion-contador">{solicitudes.length}</span>
                )}
            </button>
            
            {isOpen && (
                <div className="notificacion-menu">
                    <div className="notificacion-header">
                        <h3>Solicitudes Pendientes</h3>
                    </div>
                    <div className="notificacion-contenido">
                        {loading ? (
                            <div className="notificacion-cargando">Cargando solicitudes...</div>
                        ) : error ? (
                            <div className="notificacion-error">{error}</div>
                        ) : solicitudes.length === 0 ? (
                            <div className="notificacion-vacia">No hay solicitudes pendientes</div>
                        ) : (
                            <ul className="notificacion-lista">
                                {solicitudes.map((solicitud) => (
                                    <li key={solicitud.id} className="notificacion-item">
                                        <div className="solicitud-info">
                                            <h4>{solicitud.nombre} {solicitud.apellidos}</h4>
                                            <p>Correo: {solicitud.correo}</p>
                                            <p>CI: {solicitud.ci}</p>
                                            <p>Celular: {solicitud.celular}</p>
                                            <p className="solicitud-fecha">
                                                {new Date(solicitud.fecha_solicitud).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="solicitud-acciones">
                                            <button 
                                                className="solicitud-aprobar"
                                                onClick={() => handleApprobarSolicitud(solicitud.id)}
                                            >
                                                Aprobar
                                            </button>
                                            <button 
                                                className="solicitud-rechazar"
                                                onClick={() => handleRechazarSolicitud(solicitud.id)}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificacionMenu;