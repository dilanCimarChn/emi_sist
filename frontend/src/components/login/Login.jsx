import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ actualizarRol }) => {  // Añadir actualizarRol aquí
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [verContrasena, setVerContrasena] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correo || !emailRegex.test(correo)) {
            setError('Por favor, ingrese un correo electrónico válido');
            setLoading(false);
            return;
        }

        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/login',
                { correo, contrasena },
                {
                    timeout: 5000,
                    validateStatus: (status) => status >= 200 && status < 500
                }
            );

            switch (res.status) {
                case 200:
                    localStorage.setItem('authToken', res.data.token);
                    localStorage.setItem('rol', res.data.rol);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                    actualizarRol(res.data.rol); // Actualizar rol aquí correctamente

                    switch (res.data.rol) {
                        case 'admin':
                            navigate('/admin');
                            break;
                        case 'docente':
                            navigate('/docente');
                            break;
                        default:
                            navigate('/dashboard');
                    }
                    break;
                case 401:
                    setError('Credenciales incorrectas');
                    break;
                case 404:
                    setError('Usuario no encontrado');
                    break;
                default:
                    setError(res.data.message || 'Error en el inicio de sesión');
            }
        } catch (error) {
            console.error('Error de inicio de sesión:', error);
            setError(
                error.response?.data?.message ||
                'Error de conexión. Por favor, intente nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <form onSubmit={handleLogin}>
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="login-input"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={verContrasena ? 'text' : 'password'}
                            placeholder="Contraseña"
                            className="login-input"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setVerContrasena(!verContrasena)}
                        >
                            {verContrasena ? 'Ocultar' : 'Ver'}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
