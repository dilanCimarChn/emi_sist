import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormularioDocente from '../components/admin/FormularioDocente';
import ResumenDocente from './ResumenDocente'; // Asegúrate de que exista esta vista

const Vdocente = ({ actualizarRol }) => {
  const navigate = useNavigate();
  const [docenteRegistrado, setDocenteRegistrado] = useState(null); // null = cargando, false = nuevo, true = ya registrado

  const usuarioId = localStorage.getItem('usuario_id'); // Asegúrate de guardar esto al iniciar sesión

  const handleLogout = () => {
    localStorage.clear();
    actualizarRol(null);
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`http://localhost:5000/api/docentes/usuario/${usuarioId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data?.docente) {
          setDocenteRegistrado(true);
        } else {
          setDocenteRegistrado(false);
        }
      } catch (error) {
        setDocenteRegistrado(false);
      }
    };

    if (usuarioId) {
      fetchDocente();
    }
  }, [usuarioId]);

  if (docenteRegistrado === null) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Panel del Docente</h1>
      <p>Bienvenido docente, aquí podrás gestionar tus actividades académicas.</p>

      {docenteRegistrado ? (
        <ResumenDocente usuarioId={usuarioId} />
      ) : (
        <FormularioDocente usuarioId={usuarioId} />
      )}

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Vdocente;
