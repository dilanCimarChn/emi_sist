// ✅ FormularioDocente.jsx (Frontend)
import React, { useState, useEffect } from 'react';
import './FormularioDocente.css';
import { useNavigate } from 'react-router-dom';

const FormularioDocente = () => {
  const [formData, setFormData] = useState({
    usuario_id: '', nombres: '', apellidos: '', correo_electronico: '', ci: '', genero: '',
    grado_academico: '', titulo: '', anio_titulacion: '', universidad: '',
    experiencia_laboral: '', experiencia_docente: '', categoria_docente: '',
    modalidad_ingreso: '', asignaturas: ''
  });
  const [fotografia, setFotografia] = useState(null);
  const [diplomados, setDiplomados] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [maestrias, setMaestrias] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [phds, setPhds] = useState([{ anio: '', universidad: '', certificado: null }]);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('usuario_id');
    if (!id) return navigate('/');
    setFormData(prev => ({ ...prev, usuario_id: id }));

    fetch(`http://localhost:5000/api/docentes/usuario/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.docente) {
          alert('Ya completaste el formulario. Serás redirigido.');
          navigate('/docente');
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => setFotografia(e.target.files[0]);

  const handleAddField = (setFunc, list) => {
    setFunc([...list, { anio: '', universidad: '', certificado: null }]);
  };

  const handleDynamicChange = (e, index, list, setList) => {
    const { name, value, files } = e.target;
    const updated = [...list];
    updated[index][name] = name === 'certificado' ? files[0] : value;
    setList(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (fotografia) data.append('fotografia', fotografia);

    const appendItems = (items, tipo) => {
      items.forEach((item, i) => {
        data.append(`${tipo}[${i}][anio]`, item.anio);
        data.append(`${tipo}[${i}][universidad]`, item.universidad);
        if (item.certificado) data.append(`${tipo}[${i}][certificado]`, item.certificado);
      });
    };

    appendItems(diplomados, 'diplomados');
    appendItems(maestrias, 'maestrias');
    appendItems(phds, 'phds');

    try {
        const token = localStorage.getItem('authToken');

        const res = await fetch('http://localhost:5000/api/docentes/crear', {
          method: 'POST',
          body: data,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
      const result = await res.json();
      alert(result.message || 'Formulario enviado correctamente');
      navigate('/docente');
    } catch (err) {
      alert('Error al enviar formulario');
      console.error(err);
    }
  };

  return (
    <form className="form-docente" onSubmit={handleSubmit}>
      <h2>Formulario de Registro Docente</h2>
      <input type="text" name="nombres" placeholder="Nombres" onChange={handleChange} required />
      <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleChange} required />
      <input type="email" name="correo_electronico" placeholder="Correo electrónico" onChange={handleChange} required />
      <input type="text" name="ci" placeholder="CI" onChange={handleChange} required />
      <select name="genero" onChange={handleChange} required>
        <option value="">Seleccione género</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
        <option value="otro">Otro</option>
      </select>
      <input type="text" name="grado_academico" placeholder="Grado académico" onChange={handleChange} required />
      <input type="text" name="titulo" placeholder="Título" onChange={handleChange} required />
      <input type="number" name="anio_titulacion" placeholder="Año de Titulación" onChange={handleChange} required />
      <input type="text" name="universidad" placeholder="Universidad" onChange={handleChange} required />
      <input type="number" name="experiencia_laboral" placeholder="Experiencia laboral" onChange={handleChange} required />
      <input type="number" name="experiencia_docente" placeholder="Experiencia docente" onChange={handleChange} required />
      <input type="text" name="categoria_docente" placeholder="Categoría docente" onChange={handleChange} required />
      <input type="text" name="modalidad_ingreso" placeholder="Modalidad de ingreso" onChange={handleChange} required />
      <textarea name="asignaturas" placeholder="Asignaturas que dicta" onChange={handleChange} />
      <label>Fotografía:</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <h3>Diplomados</h3>
      {diplomados.map((item, i) => (
        <div key={i}>
          <input type="text" name="universidad" placeholder="Universidad" onChange={e => handleDynamicChange(e, i, diplomados, setDiplomados)} />
          <input type="number" name="anio" placeholder="Año" onChange={e => handleDynamicChange(e, i, diplomados, setDiplomados)} />
          <input type="file" name="certificado" onChange={e => handleDynamicChange(e, i, diplomados, setDiplomados)} />
        </div>
      ))}
      <button type="button" onClick={() => handleAddField(setDiplomados, diplomados)}>+ Añadir diplomado</button>

      <h3>Maestrías</h3>
      {maestrias.map((item, i) => (
        <div key={i}>
          <input type="text" name="universidad" placeholder="Universidad" onChange={e => handleDynamicChange(e, i, maestrias, setMaestrias)} />
          <input type="number" name="anio" placeholder="Año" onChange={e => handleDynamicChange(e, i, maestrias, setMaestrias)} />
          <input type="file" name="certificado" onChange={e => handleDynamicChange(e, i, maestrias, setMaestrias)} />
        </div>
      ))}
      <button type="button" onClick={() => handleAddField(setMaestrias, maestrias)}>+ Añadir maestría</button>

      <h3>Doctorados (PhD)</h3>
      {phds.map((item, i) => (
        <div key={i}>
          <input type="text" name="universidad" placeholder="Universidad" onChange={e => handleDynamicChange(e, i, phds, setPhds)} />
          <input type="number" name="anio" placeholder="Año" onChange={e => handleDynamicChange(e, i, phds, setPhds)} />
          <input type="file" name="certificado" onChange={e => handleDynamicChange(e, i, phds, setPhds)} />
        </div>
      ))}
      <button type="button" onClick={() => handleAddField(setPhds, phds)}>+ Añadir doctorado</button>

      <br />
      <button type="submit">Enviar</button>
    </form>
  );
};

export default FormularioDocente;
