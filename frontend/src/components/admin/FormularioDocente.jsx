import React, { useState, useEffect } from 'react';
import './FormularioDocente.css';
import { useNavigate } from 'react-router-dom';

const FormularioDocente = ({ onFormSuccess }) => {
  const [formData, setFormData] = useState({
    usuario_id: '', nombres: '', apellidos: '', correo_electronico: '', ci: '', genero: '',
    grado_academico: '', titulo: '', anio_titulacion: '', universidad: '',
    experiencia_laboral: '', experiencia_docente: '', categoria_docente: '',
    modalidad_ingreso: '', asignaturas: []
  });
  const [fotografia, setFotografia] = useState(null);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [diplomados, setDiplomados] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [maestrias, setMaestrias] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [phds, setPhds] = useState([{ anio: '', universidad: '', certificado: null }]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [activeSection, setActiveSection] = useState('personal');
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('authToken');
    if (!id || !token) return navigate('/');
  
    setFormData(prev => ({ ...prev, usuario_id: id }));
  
    // Verificar si el docente ya completó el formulario
    fetch(`http://localhost:5000/api/docentes/usuario/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) throw new Error("No autorizado");
        return res.json();
      })
      .then(data => {
        if (data?.docente) {
          if (onFormSuccess) {
            onFormSuccess();
          } else {
            alert('Ya completaste el formulario. Serás redirigido.');
            navigate('/docente');
          }
        }
      })
      .catch(err => console.error('❌ Error al verificar docente:', err));
  
    // Cargar asignaturas disponibles
    fetch('http://localhost:5000/api/asignaturas')
      .then(res => res.ok ? res.json() : Promise.reject('No se pudo obtener asignaturas'))
      .then(data => setAsignaturasDisponibles(data))
      .catch(err => {
        console.error('❌ Error al cargar asignaturas:', err);
        setAsignaturasDisponibles([]);
      });
  }, [navigate, onFormSuccess]);
  


  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFotografia(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddField = (setFunc, list) => {
    setFunc([...list, { anio: '', universidad: '', certificado: null }]);
  };

  const handleRemoveField = (index, list, setList) => {
    if (list.length > 1) {
      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);
    }
  };

  const handleDynamicChange = (e, index, list, setList) => {
    const { name, value, files } = e.target;
    const updated = [...list];
    updated[index][name] = name === 'certificado' ? files[0] : value;
    setList(updated);
  };

  const changeSection = (section) => {
    setActiveSection(section);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ texto: '', tipo: '' });

    const data = new FormData();
    
// Datos básicos del docente (con asignaturas como JSON)
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'asignaturas') {
        data.append(key, JSON.stringify(value)); // ✅ Enviar asignaturas como array
      } else {
        data.append(key, value);
      }
    });

    
    // Foto de perfil
    if (fotografia) data.append('fotografia', fotografia);

    diplomados.forEach((item, i) => {
      if (item.certificado) {
        data.append(`diplomados[${i}][certificado]`, item.certificado);
      }
    });

    maestrias.forEach((item, i) => {
      if (item.certificado) {
        data.append(`maestrias[${i}][certificado]`, item.certificado);
      }
    });

    phds.forEach((item, i) => {
      if (item.certificado) {
        data.append(`phds[${i}][certificado]`, item.certificado);
      }
    });

    // ✅ Enviar arrays como string JSON (para el backend)
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
      
      if (res.ok) {
        setMensaje({ 
          texto: result.message || 'Formulario enviado correctamente', 
          tipo: 'success' 
        });
        
        setTimeout(() => {
          if (onFormSuccess && typeof onFormSuccess === 'function') {
            onFormSuccess();
          } else {
            navigate('/docente');
          }
        }, 1500);
      } else {
        setMensaje({ 
          texto: result.message || 'Error al enviar formulario', 
          tipo: 'error' 
        });
      }
    } catch (err) {
      setMensaje({ 
        texto: 'Error al enviar formulario. Compruebe su conexión.', 
        tipo: 'error' 
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-wrapper">
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="formulario-header">
        <div className={`foto-preview ${!fotoPreview ? 'empty' : ''}`}>
          {fotoPreview ? (
            <img src={fotoPreview} alt="Vista previa" />
          ) : (
            <div className="upload-placeholder">
              <i className="icon-user">👤</i>
              <span>Foto</span>
            </div>
          )}
          <div className="foto-upload">
            <label htmlFor="foto-input" className="upload-btn">
              {fotoPreview ? 'Cambiar' : 'Subir foto'}
            </label>
            <input 
              id="foto-input"
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              hidden
            />
          </div>
        </div>
        <h2>Formulario de Registro Docente</h2>
      </div>

      <div className="form-navigation">
        <button 
          type="button" 
          className={activeSection === 'personal' ? 'active' : ''}
          onClick={() => changeSection('personal')}
        >
          Información Personal
        </button>
        <button 
          type="button" 
          className={activeSection === 'academica' ? 'active' : ''}
          onClick={() => changeSection('academica')}
        >
          Formación Académica
        </button>
        <button 
          type="button" 
          className={activeSection === 'experiencia' ? 'active' : ''}
          onClick={() => changeSection('experiencia')}
        >
          Experiencia
        </button>
        <button 
          type="button" 
          className={activeSection === 'adicional' ? 'active' : ''}
          onClick={() => changeSection('adicional')}
        >
          Formación Adicional
        </button>
      </div>

      <form className="form-docente" onSubmit={handleSubmit}>
        {/* Sección de Información Personal */}
        <div className={`form-section ${activeSection === 'personal' ? 'active' : ''}`}>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">Nombres</label>
              <input 
                type="text" 
                name="nombres" 
                placeholder="Nombres" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Apellidos</label>
              <input 
                type="text" 
                name="apellidos" 
                placeholder="Apellidos" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">CI</label>
              <input 
                type="text" 
                name="ci" 
                placeholder="Cédula de Identidad" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Género</label>
              <select 
                name="genero" 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="required">Asignaturas que dicta</label>
              <select
                name="asignaturas"
                multiple
                value={formData.asignaturas}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                  setFormData(prev => ({ ...prev, asignaturas: selected }));
                }}
                required
                style={{
                  width: '100%',
                  height: '120px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
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
            </div>

          </div>
          <div className="form-navigation-buttons">
            <button 
              type="button" 
              className="next-btn" 
              onClick={() => changeSection('academica')}
            >
              Siguiente: Formación Académica
            </button>
          </div>
        </div>

        {/* Sección de Formación Académica */}
        <div className={`form-section ${activeSection === 'academica' ? 'active' : ''}`}>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">Grado académico</label>
              <input 
                type="text" 
                name="grado_academico" 
                placeholder="Ej: Licenciado, Ingeniero" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Título</label>
              <input 
                type="text" 
                name="titulo" 
                placeholder="Título" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Año de Titulación</label>
              <input 
                type="number" 
                name="anio_titulacion" 
                placeholder="Año" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Universidad</label>
              <input 
                type="text" 
                name="universidad" 
                placeholder="Universidad" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="form-navigation-buttons">
            <button 
              type="button" 
              className="prev-btn" 
              onClick={() => changeSection('personal')}
            >
              Anterior
            </button>
            <button 
              type="button" 
              className="next-btn" 
              onClick={() => changeSection('experiencia')}
            >
              Siguiente: Experiencia
            </button>
          </div>
        </div>

        {/* Sección de Experiencia */}
        <div className={`form-section ${activeSection === 'experiencia' ? 'active' : ''}`}>
          <div className="form-grid">
            <div className="form-group">
              <label className="required">Experiencia laboral (años)</label>
              <input 
                type="number" 
                name="experiencia_laboral" 
                placeholder="Años" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Experiencia docente (años)</label>
              <input 
                type="number" 
                name="experiencia_docente" 
                placeholder="Años" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Categoría docente</label>
              <input 
                type="text" 
                name="categoria_docente" 
                placeholder="Categoría" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="required">Modalidad de ingreso</label>
              <input 
                type="text" 
                name="modalidad_ingreso" 
                placeholder="Modalidad" 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group full-width">
              <label>Asignaturas que dicta</label>
              <textarea 
                name="asignaturas" 
                placeholder="Lista de asignaturas (una por línea)" 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="form-navigation-buttons">
            <button 
              type="button" 
              className="prev-btn" 
              onClick={() => changeSection('academica')}
            >
              Anterior
            </button>
            <button 
              type="button" 
              className="next-btn" 
              onClick={() => changeSection('adicional')}
            >
              Siguiente: Formación Adicional
            </button>
          </div>
        </div>

        {/* Sección de Formación Adicional */}
        <div className={`form-section ${activeSection === 'adicional' ? 'active' : ''}`}>
          <h3>Diplomados</h3>
          {diplomados.map((item, i) => (
            <div key={i} className="dynamic-field">
              <div className="dynamic-field-header">
                <span>Diplomado {i + 1}</span>
                {diplomados.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => handleRemoveField(i, diplomados, setDiplomados)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Universidad</label>
                  <input 
                    type="text" 
                    name="universidad" 
                    placeholder="Universidad" 
                    value={item.universidad || ''}
                    onChange={e => handleDynamicChange(e, i, diplomados, setDiplomados)} 
                  />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input 
                    type="number" 
                    name="anio" 
                    placeholder="Año" 
                    value={item.anio || ''}
                    onChange={e => handleDynamicChange(e, i, diplomados, setDiplomados)} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Certificado (opcional)</label>
                  <input 
                    type="file" 
                    name="certificado" 
                    accept="image/*,application/pdf" 
                    onChange={e => handleDynamicChange(e, i, diplomados, setDiplomados)} 
                  />
                  {item.certificado && (
                    <div className="file-selected">
                      {typeof item.certificado === 'string' ? item.certificado : item.certificado.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            className="add-btn" 
            onClick={() => handleAddField(setDiplomados, diplomados)}
          >
            + Añadir diplomado
          </button>

          <h3>Maestrías</h3>
          {maestrias.map((item, i) => (
            <div key={i} className="dynamic-field">
              <div className="dynamic-field-header">
                <span>Maestría {i + 1}</span>
                {maestrias.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => handleRemoveField(i, maestrias, setMaestrias)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Universidad</label>
                  <input 
                    type="text" 
                    name="universidad" 
                    placeholder="Universidad" 
                    value={item.universidad || ''}
                    onChange={e => handleDynamicChange(e, i, maestrias, setMaestrias)} 
                  />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input 
                    type="number" 
                    name="anio" 
                    placeholder="Año" 
                    value={item.anio || ''}
                    onChange={e => handleDynamicChange(e, i, maestrias, setMaestrias)} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Certificado (opcional)</label>
                  <input 
                    type="file" 
                    name="certificado" 
                    accept="image/*,application/pdf" 
                    onChange={e => handleDynamicChange(e, i, maestrias, setMaestrias)} 
                  />
                  {item.certificado && (
                    <div className="file-selected">
                      {typeof item.certificado === 'string' ? item.certificado : item.certificado.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            className="add-btn" 
            onClick={() => handleAddField(setMaestrias, maestrias)}
          >
            + Añadir maestría
          </button>

          <h3>Doctorados (PhD)</h3>
          {phds.map((item, i) => (
            <div key={i} className="dynamic-field">
              <div className="dynamic-field-header">
                <span>Doctorado {i + 1}</span>
                {phds.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={() => handleRemoveField(i, phds, setPhds)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Universidad</label>
                  <input 
                    type="text" 
                    name="universidad" 
                    placeholder="Universidad" 
                    value={item.universidad || ''}
                    onChange={e => handleDynamicChange(e, i, phds, setPhds)} 
                  />
                </div>
                <div className="form-group">
                  <label>Año</label>
                  <input 
                    type="number" 
                    name="anio" 
                    placeholder="Año" 
                    value={item.anio || ''}
                    onChange={e => handleDynamicChange(e, i, phds, setPhds)} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Certificado (opcional)</label>
                  <input 
                    type="file" 
                    name="certificado" 
                    accept="image/*,application/pdf" 
                    onChange={e => handleDynamicChange(e, i, phds, setPhds)} 
                  />
                  {item.certificado && (
                    <div className="file-selected">
                      {typeof item.certificado === 'string' ? item.certificado : item.certificado.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button 
            type="button" 
            className="add-btn" 
            onClick={() => handleAddField(setPhds, phds)}
          >
            + Añadir doctorado
          </button>

          <div className="form-navigation-buttons">
            <button 
              type="button" 
              className="prev-btn" 
              onClick={() => changeSection('experiencia')}
            >
              Anterior
            </button>
            {loading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Enviando formulario...</span>
              </div>
            ) : (
              <button type="submit" className="submit-btn">
                Guardar y Enviar
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormularioDocente;