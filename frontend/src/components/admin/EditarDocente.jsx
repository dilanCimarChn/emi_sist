import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditarDocente.css';

const EditarDocente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo_electronico: '',
    grado_academico: '',
    titulo: '',
    universidad: '',
    anio_titulacion: ''
  });

  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchDocente = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/docentes/${id}`);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar docente:', error);
      }
    };
    fetchDocente();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/docentes/${id}`, formData);
      setMensaje('✅ Docente actualizado correctamente');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setMensaje('❌ Error al actualizar el docente');
    }
  };

  if (loading) return <p>Cargando información...</p>;

  return (
    <div className="editar-docente-container">
      <h2>Editar Docente</h2>
      {mensaje && <div className="mensaje">{mensaje}</div>}
      <form onSubmit={handleSubmit} className="form-docente">
        <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Nombres" required />
        <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Apellidos" required />
        <input type="email" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} placeholder="Correo electrónico" required />
        <input type="text" name="grado_academico" value={formData.grado_academico} onChange={handleChange} placeholder="Grado académico" />
        <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título" />
        <input type="text" name="universidad" value={formData.universidad} onChange={handleChange} placeholder="Universidad" />
        <input type="number" name="anio_titulacion" value={formData.anio_titulacion} onChange={handleChange} placeholder="Año de titulación" />
        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
};

export default EditarDocente;
