import React, { useState, useEffect } from 'react';
import './FormularioDocente.css';
import { useNavigate } from 'react-router-dom';
import makeAnimated from 'react-select/animated';

const FormularioDocente = () => {
  const [formData, setFormData] = useState({
    usuario_id: '',
    nombres: '', apellidos: '', correo_electronico: '', ci: '', genero: '',
    grado_academico: '', titulo: '', anio_titulacion: '', universidad: '',
    experiencia_laboral: '', experiencia_docente: '', categoria_docente: '',
    modalidad_ingreso: '', asignaturas: []
  });

  const [fotografia, setFotografia] = useState(null);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [diplomados, setDiplomados] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [maestrias, setMaestrias] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [phds, setPhds] = useState([{ anio: '', universidad: '', certificado: null }]);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('authToken');

    if (!id || !token) return navigate('/');

    setFormData(prev => ({ ...prev, usuario_id: id }));

    // Verificar si ya existe un docente
    fetch(`http://localhost:5000/api/docentes/usuario/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('No autorizado'))
      .then(data => {
        if (data?.docente) {
          alert('Ya completaste el formulario. Serás redirigido.');
          navigate('/docente');
        }
      })
      .catch(err => console.error('❌ Error al verificar docente:', err));

    // Cargar asignaturas
    fetch('http://localhost:5000/api/asignaturas')
      .then(res => res.ok ? res.json() : Promise.reject('No se pudo obtener asignaturas'))
      .then(data => setAsignaturasDisponibles(data))
      .catch(err => {
        console.error('❌ Error al cargar asignaturas:', err);
        setAsignaturasDisponibles([]);
      });
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

    // Añadir campos normales
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, key === 'asignaturas' ? JSON.stringify(value) : value);
    });

    if (fotografia) data.append('fotografia', fotografia);

    // Añadir certificados
    diplomados.forEach((item, i) => {
      if (item.certificado) data.append(`diplomados[${i}][certificado]`, item.certificado);
    });
    maestrias.forEach((item, i) => {
      if (item.certificado) data.append(`maestrias[${i}][certificado]`, item.certificado);
    });
    phds.forEach((item, i) => {
      if (item.certificado) data.append(`phds[${i}][certificado]`, item.certificado);
    });

    // Agregar arrays sin certificados
    data.append("diplomados", JSON.stringify(diplomados.map(({ anio, universidad }) => ({ anio, universidad }))));
    data.append("maestrias", JSON.stringify(maestrias.map(({ anio, universidad }) => ({ anio, universidad }))));
    data.append("phds", JSON.stringify(phds.map(({ anio, universidad }) => ({ anio, universidad }))));

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
      alert('❌ Error al enviar formulario');
      console.error('Error:', err);
    }
  };

  return (
    <form className="form-docente" onSubmit={handleSubmit}>
      <h2>Formulario de Registro Docente</h2>

      {/* Campos básicos */}
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
      <input type="number" name="experiencia_laboral" placeholder="Experiencia laboral (años)" onChange={handleChange} required />
      <input type="number" name="experiencia_docente" placeholder="Experiencia docente (años)" onChange={handleChange} required />
      <input type="text" name="categoria_docente" placeholder="Categoría docente" onChange={handleChange} required />
      <input type="text" name="modalidad_ingreso" placeholder="Modalidad de ingreso" onChange={handleChange} required />

      {/* Asignaturas seleccionables */}
      <label>Asignaturas que dicta:</label>
        <select
          name="asignaturas"
          multiple
          value={formData.asignaturas}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            setFormData(prev => ({ ...prev, asignaturas: selected }));
          }}
          style={{
            width: '100%',
            height: '120px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            padding: '8px',
            fontSize: '14px',
            backgroundColor: '#f9f9f9'
          }}
          required
        >
          {asignaturasDisponibles.length > 0 ? (
            asignaturasDisponibles.map(asig => (
              <option key={asig.id} value={asig.id}>
                {asig.nombre}
              </option>
            ))
          ) : (
            <option disabled>No hay asignaturas disponibles</option>
          )}
        </select>



      {/* Fotografía */}
      <label>Fotografía:</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {/* Estudios */}
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
