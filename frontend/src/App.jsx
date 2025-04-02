import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Vadmin from './views/Vadmin';
import Vdocente from './views/Vdocente';
import { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [rol, setRol] = useState(localStorage.getItem('rol'));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Configurar interceptor para tokens expirados
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('authToken');
          localStorage.removeItem('rol');
          localStorage.removeItem('usuarioId');
          setRol(null);
        }
        return Promise.reject(error);
      }
    );

    // Verificar token al cargar
    const verificarToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Opcional: Verificar token con el backend
          // const res = await axios.get('http://localhost:5000/api/auth/verificar-token', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // Si llegamos aquí, el token es válido
          setRol(localStorage.getItem('rol'));
        } catch (error) {
          // Token inválido
          localStorage.removeItem('authToken');
          localStorage.removeItem('rol');
          localStorage.removeItem('usuarioId');
          setRol(null);
        }
      }
      setCargando(false);
    };

    verificarToken();

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const actualizarRol = (nuevoRol, usuarioId = null) => {
    setRol(nuevoRol);
    if (usuarioId) {
      localStorage.setItem('usuarioId', usuarioId);
    }
  };

  if (cargando) {
    return <div className="loading-app">Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login actualizarRol={actualizarRol} />} />
        <Route 
          path="/admin" 
          element={rol === 'admin' ? <Vadmin actualizarRol={actualizarRol}/> : <Navigate to="/" />} 
        />
        <Route 
          path="/docente" 
          element={rol === 'docente' ? <Vdocente actualizarRol={actualizarRol}/> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;