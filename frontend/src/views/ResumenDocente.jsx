import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumenDocente.css';

const ResumenDocente = () => {
  const [docente, setDocente] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [certificadoPreview, setCertificadoPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [estudios, setEstudios] = useState({
    diplomados: [],
    maestrias: [],
    phds: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const usuario_id = localStorage.getItem('usuario_id');
    const token = localStorage.getItem('authToken');

    if (!usuario_id || !token) {
      return navigate('/');
    }

    const fetchDatos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/docentes/usuario/${usuario_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.docente) {
          const docenteData = res.data.docente;
          setDocente(docenteData);
          
          // Inicializar datos para edición
          setEditedData({ ...docenteData });
          
          // Obtener estudios si existen
          if (docenteData.id) {
            try {
              const estRes = await axios.get(`http://localhost:5000/api/docentes/${docenteData.id}/estudios`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (estRes.data) {
                // Organizar los estudios por tipo
                const diplomados = estRes.data.filter(est => est.tipo === 'diplomado') || [];
                const maestrias = estRes.data.filter(est => est.tipo === 'maestria') || [];
                const phds = estRes.data.filter(est => est.tipo === 'phd') || [];
                
                setEstudios({
                  diplomados,
                  maestrias,
                  phds
                });
                
                // Agregar estudios a los datos editables
                setEditedData(prev => ({
                  ...prev,
                  estudios: {
                    diplomados,
                    maestrias,
                    phds
                  }
                }));
              }
            } catch (error) {
              console.error('Error al obtener estudios:', error);
            }
          }
        } else {
          navigate('/formulario'); // Si no tiene datos, lo mandamos a llenar
        }
      } catch (error) {
        console.error('Error al obtener datos del docente:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePreviewCertificado = (url) => {
    setCertificadoPreview(url);
  };

  const closePreview = () => {
    setCertificadoPreview(null);
  };

  const toggleEditMode = () => {
    if (editMode) {
      // Si estamos saliendo del modo edición, descartamos los cambios
      setEditedData({...docente, estudios});
      setPhotoPreview(null);
      setNewPhoto(null);
    } else {
      // Si estamos entrando en modo edición, aseguramos que editedData tenga los datos actuales
      setEditedData({...docente, estudios});
    }
    setEditMode(!editMode);
    setMessage({ text: '', type: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificadoChange = (e, tipo, index) => {
    const file = e.target.files[0];
    if (file) {
      // Crear una copia del arreglo a modificar
      const updatedArray = [...editedData.estudios[tipo]];
      updatedArray[index].newCertificado = file;
      updatedArray[index].certificadoChanged = true;
      
      // Actualizar el estado
      setEditedData(prev => ({
        ...prev,
        estudios: {
          ...prev.estudios,
          [tipo]: updatedArray
        }
      }));
    }
  };

  const addFormacion = (tipo) => {
    // Agregar nueva formación (inicialmente vacía)
    const newItem = { 
      tipo: tipo === 'diplomados' ? 'diplomado' : tipo === 'maestrias' ? 'maestria' : 'phd',
      anio: '', 
      universidad: '', 
      certificado: null, 
      isNew: true 
    };
    
    setEditedData(prev => ({
      ...prev,
      estudios: {
        ...prev.estudios,
        [tipo]: [...prev.estudios[tipo], newItem]
      }
    }));
  };

  const removeFormacion = (tipo, index) => {
    const updatedArray = [...editedData.estudios[tipo]];
    
    // Si es un elemento nuevo, simplemente lo removemos
    if (updatedArray[index].isNew) {
      updatedArray.splice(index, 1);
    } else {
      // Si es un elemento existente, lo marcamos para eliminación
      updatedArray[index].toDelete = true;
    }
    
    setEditedData(prev => ({
      ...prev,
      estudios: {
        ...prev.estudios,
        [tipo]: updatedArray
      }
    }));
  };

  const undoRemoveFormacion = (tipo, index) => {
    const updatedArray = [...editedData.estudios[tipo]];
    updatedArray[index].toDelete = false;
    
    setEditedData(prev => ({
      ...prev,
      estudios: {
        ...prev.estudios,
        [tipo]: updatedArray
      }
    }));
  };

  const handleFormacionChange = (e, tipo, index, field) => {
    const { value } = e.target;
    const updatedArray = [...editedData.estudios[tipo]];
    updatedArray[index][field] = value;
    
    setEditedData(prev => ({
      ...prev,
      estudios: {
        ...prev.estudios,
        [tipo]: updatedArray
      }
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const token = localStorage.getItem('authToken');
      const data = new FormData();
      
      // Agregar datos básicos
      const basicFields = [
        'nombres', 'apellidos', 'correo_electronico', 'ci', 'genero',
        'grado_academico', 'titulo', 'anio_titulacion', 'universidad',
        'experiencia_laboral', 'experiencia_docente', 'categoria_docente',
        'modalidad_ingreso', 'asignaturas'
      ];
      
      basicFields.forEach(field => {
        if (editedData[field] !== undefined) {
          data.append(field, editedData[field]);
        }
      });
      
      // Si hay nueva foto, la agregamos
      if (newPhoto) {
        data.append('fotografia', newPhoto);
      } else if (docente.fotografia) {
        // Mantener la fotografía actual
        data.append('fotografia_actual', docente.fotografia);
      }
      
      // Procesar cambios en estudios
      ['diplomados', 'maestrias', 'phds'].forEach(tipo => {
        if (editedData.estudios && editedData.estudios[tipo] && editedData.estudios[tipo].length > 0) {
          // Filtrar elementos para guardar (sin los marcados para eliminar)
          const itemsToSave = editedData.estudios[tipo].filter(item => !item.toDelete);
          
          // Pasar información de estudios existentes y nuevos
          itemsToSave.forEach((item, i) => {
            // Para todos los items enviamos universidad y año
            data.append(`estudios[${tipo}][${i}][universidad]`, item.universidad || '');
            data.append(`estudios[${tipo}][${i}][anio]`, item.anio || '');
            data.append(`estudios[${tipo}][${i}][tipo]`, item.tipo);
            
            // Si es un item existente, enviamos su ID
            if (item.id) {
              data.append(`estudios[${tipo}][${i}][id]`, item.id);
            }
            
            // Si hay certificado nuevo, lo enviamos
            if (item.newCertificado) {
              data.append(`estudios[${tipo}][${i}][certificado]`, item.newCertificado);
            } else if (item.certificado && !item.certificadoChanged) {
              // Conservar certificado existente
              data.append(`estudios[${tipo}][${i}][certificado_actual]`, item.certificado);
            }
          });
          
          // Identificar IDs a eliminar
          const idsToDelete = editedData.estudios[tipo]
            .filter(item => item.toDelete && item.id)
            .map(item => item.id);
          
          if (idsToDelete.length > 0) {
            data.append(`estudios_eliminar[${tipo}]`, JSON.stringify(idsToDelete));
          }
        }
      });
      
      // Enviar al servidor
      const response = await axios.put(
        `http://localhost:5000/api/docentes/actualizar/${docente.id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        setMessage({ 
          text: 'Perfil actualizado correctamente', 
          type: 'success' 
        });
        
        // Actualizar datos locales
        const updatedDocente = response.data.docente;
        setDocente(updatedDocente);
        
        // Actualizar también los estudios
        if (response.data.estudios) {
          const diplomados = response.data.estudios.filter(est => est.tipo === 'diplomado') || [];
          const maestrias = response.data.estudios.filter(est => est.tipo === 'maestria') || [];
          const phds = response.data.estudios.filter(est => est.tipo === 'phd') || [];
          
          const updatedEstudios = {
            diplomados,
            maestrias,
            phds
          };
          
          setEstudios(updatedEstudios);
          setEditedData({
            ...updatedDocente,
            estudios: updatedEstudios
          });
        } else {
          setEditedData(updatedDocente);
        }
        
        setEditMode(false);
        setNewPhoto(null);
        setPhotoPreview(null);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMessage({ 
        text: 'Error al actualizar el perfil. Intente nuevamente.', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando perfil docente...</p>
      </div>
    );
  }

  if (!docente) return null;

  // Asegurarnos de que editedData tenga los datos actuales
  if (editMode && (!editedData || Object.keys(editedData).length === 0)) {
    setEditedData({...docente, estudios});
  }

  return (
    <div className="resumen-docente">
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="perfil-header">
        <div className="perfil-titulo">
          <h1>Perfil Académico</h1>
          <p className="subtitle">Información completa del docente</p>
        </div>
        
        <div className="perfil-actions">
          {editMode ? (
            <>
              <button 
                className="btn-cancel"
                onClick={toggleEditMode}
              >
                Cancelar edición
              </button>
              
              <button 
                className="btn-save"
                onClick={saveChanges}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          ) : (
            <button 
              className="btn-edit"
              onClick={toggleEditMode}
            >
              Editar perfil
            </button>
          )}
        </div>
      </div>

      <div className="nombre-foto-container">
        <div className="nombre-docente">
          {editMode ? (
            <>
              <input 
                type="text" 
                name="nombres" 
                value={editedData.nombres || ''} 
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Nombres"
              />
              <input 
                type="text" 
                name="apellidos" 
                value={editedData.apellidos || ''} 
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Apellidos"
              />
              <input 
                type="text" 
                name="grado_academico" 
                value={editedData.grado_academico || ''} 
                onChange={handleInputChange}
                className="edit-input badge-input"
                placeholder="Grado académico"
              />
            </>
          ) : (
            <>
              <h2>{docente.nombres} {docente.apellidos}</h2>
              <span className="badge">{docente.grado_academico}</span>
            </>
          )}
        </div>
        
        <div className="perfil-foto-container">
          {editMode ? (
            <div className="edit-foto">
              <img
                src={photoPreview || (docente.fotografia ? `http://localhost:5000/uploads/${docente.fotografia}` : '/placeholder-user.png')}
                alt="Foto de perfil"
                className="perfil-foto"
              />
              <label className="change-photo-btn">
                <span>Cambiar</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange} 
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            docente.fotografia ? (
              <img
                src={`http://localhost:5000/uploads/${docente.fotografia}`}
                alt={`${docente.nombres} ${docente.apellidos}`}
                className="perfil-foto"
              />
            ) : (
              <div className="foto-placeholder">
                <span>Sin foto</span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="perfil-tabs">
        <button 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => handleTabChange('personal')}
        >
          Información Personal
        </button>
        <button 
          className={`tab-btn ${activeTab === 'academica' ? 'active' : ''}`}
          onClick={() => handleTabChange('academica')}
        >
          Formación Académica
        </button>
        <button 
          className={`tab-btn ${activeTab === 'experiencia' ? 'active' : ''}`}
          onClick={() => handleTabChange('experiencia')}
        >
          Experiencia Profesional
        </button>
      </div>

      <div className="perfil-content">
        {/* Tab de información personal */}
        <div className={`tab-content ${activeTab === 'personal' ? 'active' : ''}`}>
          <div className="info-card">
            {editMode ? (
              <div className="edit-grid">
                <div className="edit-group">
                  <label>Nombres</label>
                  <input 
                    type="text" 
                    name="nombres" 
                    value={editedData.nombres || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="edit-group">
                  <label>Apellidos</label>
                  <input 
                    type="text" 
                    name="apellidos" 
                    value={editedData.apellidos || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="edit-group">
                  <label>CI</label>
                  <input 
                    type="text" 
                    name="ci" 
                    value={editedData.ci || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="edit-group">
                  <label>Género</label>
                  <select 
                    name="genero" 
                    value={editedData.genero || ''} 
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccione género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="edit-group full-width">
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="correo_electronico" 
                    value={editedData.correo_electronico || ''} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Nombres</span>
                    <span className="info-value">{docente.nombres || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Apellidos</span>
                    <span className="info-value">{docente.apellidos || 'No especificado'}</span>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">CI</span>
                    <span className="info-value">{docente.ci || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Género</span>
                    <span className="info-value">{docente.genero || 'No especificado'}</span>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Correo Electrónico</span>
                    <span className="info-value">{docente.correo_electronico || 'No especificado'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab de formación académica */}
        <div className={`tab-content ${activeTab === 'academica' ? 'active' : ''}`}>
          <div className="info-card">
            <h3>Formación Principal</h3>
            
            {editMode ? (
              <div className="edit-grid">
                <div className="edit-group">
                  <label>Grado Académico</label>
                  <input 
                    type="text" 
                    name="grado_academico" 
                    value={editedData.grado_academico || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="edit-group">
                  <label>Título</label>
                  <input 
                    type="text" 
                    name="titulo" 
                    value={editedData.titulo || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="edit-group">
                  <label>Año de Titulación</label>
                  <input 
                    type="number" 
                    name="anio_titulacion" 
                    value={editedData.anio_titulacion || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="edit-group">
                  <label>Universidad</label>
                  <input 
                    type="text" 
                    name="universidad" 
                    value={editedData.universidad || ''} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Grado Académico</span>
                    <span className="info-value">{docente.grado_academico || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Título</span>
                    <span className="info-value">{docente.titulo || 'No especificado'}</span>
                  </div>
                </div>
                
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Año de Titulación</span>
                    <span className="info-value">{docente.anio_titulacion || 'No especificado'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Universidad</span>
                    <span className="info-value">{docente.universidad || 'No especificado'}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Diplomados */}
          <div className="info-card">
            <div className="card-header">
              <h3>Diplomados</h3>
              {editMode && (
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={() => addFormacion('diplomados')}
                >
                  + Añadir diplomado
                </button>
              )}
            </div>
            
            {editMode ? (
              <div className="formaciones-list">
                {editedData.estudios && editedData.estudios.diplomados && editedData.estudios.diplomados.length > 0 ? (
                  editedData.estudios.diplomados.map((item, index) => (
                    !item.toDelete && (
                      <div className="formacion-item-edit" key={`diplomado-edit-${index}`}>
                        <div className="formacion-header">
                          <span className="formacion-title">Diplomado {index + 1}</span>
                          <button 
                            type="button" 
                            className="btn-remove"
                            onClick={() => removeFormacion('diplomados', index)}
                          >
                            Eliminar
                          </button>
                        </div>
                        <div className="edit-grid">
                          <div className="edit-group">
                            <label>Universidad</label>
                            <input 
                              type="text" 
                              value={item.universidad || ''} 
                              onChange={(e) => handleFormacionChange(e, 'diplomados', index, 'universidad')}
                            />
                          </div>
                          <div className="edit-group">
                            <label>Año</label>
                            <input 
                              type="number" 
                              value={item.anio || ''} 
                              onChange={(e) => handleFormacionChange(e, 'diplomados', index, 'anio')}
                            />
                          </div>
                          <div className="edit-group full-width">
                            <label>Certificado</label>
                            <div className="certificado-edit">
                              {item.certificado && !item.certificadoChanged && (
                                <div className="certificado-actual">
                                  <span>Certificado actual: {item.certificado}</span>
                                  <button
                                    type="button"
                                    className="btn-preview-small"
                                    onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                                  >
                                    Ver
                                  </button>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*,application/pdf" 
                                onChange={(e) => handleCertificadoChange(e, 'diplomados', index)}
                              />
                              {item.newCertificado && (
                                <span className="new-file">
                                  Nuevo archivo: {item.newCertificado.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <p className="no-data">No hay diplomados registrados. Haga clic en "Añadir diplomado" para agregar uno.</p>
                )}
                
                {editedData.estudios && editedData.estudios.diplomados && 
                 editedData.estudios.diplomados.some(item => item.toDelete) && (
                  <div className="deleted-items">
                    <h4>Elementos a eliminar</h4>
                    {editedData.estudios.diplomados.map((item, index) => (
                      item.toDelete && (
                        <div className="deleted-item" key={`diplomado-deleted-${index}`}>
                          <span>{item.universidad || 'Sin universidad'} ({item.anio || 'Sin año'})</span>
                          <button 
                            type="button" 
                            className="btn-restore"
                            onClick={() => undoRemoveFormacion('diplomados', index)}
                          >
                            Restaurar
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="certificados-grid">
                {estudios.diplomados && estudios.diplomados.length > 0 ? (
                  estudios.diplomados.map((item, index) => (
                    <div className="certificado-item" key={`diplomado-${index}`}>
                      <div className="certificado-info">
                        <h4>{item.universidad || 'Universidad no especificada'}</h4>
                        <p>Año: {item.anio || 'No especificado'}</p>
                      </div>
                      {item.certificado && (
                        <button 
                          className="btn-preview" 
                          onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                        >
                          Ver certificado
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-data">No hay diplomados registrados</p>
                )}
              </div>
            )}
          </div>

          {/* Maestrías */}
          <div className="info-card">
            <div className="card-header">
              <h3>Maestrías</h3>
              {editMode && (
                <button 
                  type="button" 
                  className="btn-add"
                  onClick={() => addFormacion('maestrias')}
                >
                  + Añadir maestría
                </button>
              )}
            </div>
            
            {editMode ? (
              <div className="formaciones-list">
                {editedData.estudios && editedData.estudios.maestrias && editedData.estudios.maestrias.length > 0 ? (
                  editedData.estudios.maestrias.map((item, index) => (
                    !item.toDelete && (
                      <div className="formacion-item-edit" key={`maestria-edit-${index}`}>
                        <div className="formacion-header">
                          <span className="formacion-title">Maestría {index + 1}</span>
                          <button 
                            type="button" 
                            className="btn-remove"
                            onClick={() => removeFormacion('maestrias', index)}
                          >
                            Eliminar
                          </button>
                        </div>
                        <div className="edit-grid">
                          <div className="edit-group">
                            <label>Universidad</label>
                            <input 
                              type="text" 
                              value={item.universidad || ''} 
                              onChange={(e) => handleFormacionChange(e, 'maestrias', index, 'universidad')}
                            />
                          </div>
                          <div className="edit-group">
                            <label>Año</label>
                            <input 
                              type="number" 
                              value={item.anio || ''} 
                              onChange={(e) => handleFormacionChange(e, 'maestrias', index, 'anio')}
                            />
                          </div>
                          <div className="edit-group full-width">
                            <label>Certificado</label>
                            <div className="certificado-edit">
                              {item.certificado && !item.certificadoChanged && (
                                <div className="certificado-actual">
                                <span>Certificado actual: {item.certificado}</span>
                                <button
                                  type="button"
                                  className="btn-preview-small"
                                  onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                                >
                                  Ver
                                </button>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              onChange={(e) => handleCertificadoChange(e, 'maestrias', index)}
                            />
                            {item.newCertificado && (
                              <span className="new-file">
                                Nuevo archivo: {item.newCertificado.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <p className="no-data">No hay maestrías registradas. Haga clic en "Añadir maestría" para agregar una.</p>
              )}
              
              {editedData.estudios && editedData.estudios.maestrias && 
               editedData.estudios.maestrias.some(item => item.toDelete) && (
                <div className="deleted-items">
                  <h4>Elementos a eliminar</h4>
                  {editedData.estudios.maestrias.map((item, index) => (
                    item.toDelete && (
                      <div className="deleted-item" key={`maestria-deleted-${index}`}>
                        <span>{item.universidad || 'Sin universidad'} ({item.anio || 'Sin año'})</span>
                        <button 
                          type="button" 
                          className="btn-restore"
                          onClick={() => undoRemoveFormacion('maestrias', index)}
                        >
                          Restaurar
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="certificados-grid">
              {estudios.maestrias && estudios.maestrias.length > 0 ? (
                estudios.maestrias.map((item, index) => (
                  <div className="certificado-item" key={`maestria-${index}`}>
                    <div className="certificado-info">
                      <h4>{item.universidad || 'Universidad no especificada'}</h4>
                      <p>Año: {item.anio || 'No especificado'}</p>
                    </div>
                    {item.certificado && (
                      <button 
                        className="btn-preview" 
                        onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                      >
                        Ver certificado
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No hay maestrías registradas</p>
              )}
            </div>
          )}
        </div>

        {/* Doctorados */}
        <div className="info-card">
          <div className="card-header">
            <h3>Doctorados (PhD)</h3>
            {editMode && (
              <button 
                type="button" 
                className="btn-add"
                onClick={() => addFormacion('phds')}
              >
                + Añadir doctorado
              </button>
            )}
          </div>
          
          {editMode ? (
            <div className="formaciones-list">
              {editedData.estudios && editedData.estudios.phds && editedData.estudios.phds.length > 0 ? (
                editedData.estudios.phds.map((item, index) => (
                  !item.toDelete && (
                    <div className="formacion-item-edit" key={`phd-edit-${index}`}>
                      <div className="formacion-header">
                        <span className="formacion-title">Doctorado {index + 1}</span>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => removeFormacion('phds', index)}
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className="edit-grid">
                        <div className="edit-group">
                          <label>Universidad</label>
                          <input 
                            type="text" 
                            value={item.universidad || ''} 
                            onChange={(e) => handleFormacionChange(e, 'phds', index, 'universidad')}
                          />
                        </div>
                        <div className="edit-group">
                          <label>Año</label>
                          <input 
                            type="number" 
                            value={item.anio || ''} 
                            onChange={(e) => handleFormacionChange(e, 'phds', index, 'anio')}
                          />
                        </div>
                        <div className="edit-group full-width">
                          <label>Certificado</label>
                          <div className="certificado-edit">
                            {item.certificado && !item.certificadoChanged && (
                              <div className="certificado-actual">
                                <span>Certificado actual: {item.certificado}</span>
                                <button
                                  type="button"
                                  className="btn-preview-small"
                                  onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                                >
                                  Ver
                                </button>
                              </div>
                            )}
                            <input 
                              type="file" 
                              accept="image/*,application/pdf" 
                              onChange={(e) => handleCertificadoChange(e, 'phds', index)}
                            />
                            {item.newCertificado && (
                              <span className="new-file">
                                Nuevo archivo: {item.newCertificado.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <p className="no-data">No hay doctorados registrados. Haga clic en "Añadir doctorado" para agregar uno.</p>
              )}
              
              {editedData.estudios && editedData.estudios.phds && 
               editedData.estudios.phds.some(item => item.toDelete) && (
                <div className="deleted-items">
                  <h4>Elementos a eliminar</h4>
                  {editedData.estudios.phds.map((item, index) => (
                    item.toDelete && (
                      <div className="deleted-item" key={`phd-deleted-${index}`}>
                        <span>{item.universidad || 'Sin universidad'} ({item.anio || 'Sin año'})</span>
                        <button 
                          type="button" 
                          className="btn-restore"
                          onClick={() => undoRemoveFormacion('phds', index)}
                        >
                          Restaurar
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="certificados-grid">
              {estudios.phds && estudios.phds.length > 0 ? (
                estudios.phds.map((item, index) => (
                  <div className="certificado-item" key={`phd-${index}`}>
                    <div className="certificado-info">
                      <h4>{item.universidad || 'Universidad no especificada'}</h4>
                      <p>Año: {item.anio || 'No especificado'}</p>
                    </div>
                    {item.certificado && (
                      <button 
                        className="btn-preview" 
                        onClick={() => handlePreviewCertificado(`http://localhost:5000/uploads/${item.certificado}`)}
                      >
                        Ver certificado
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No hay doctorados registrados</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tab de experiencia profesional */}
      <div className={`tab-content ${activeTab === 'experiencia' ? 'active' : ''}`}>
        <div className="info-card">
          <h3>Experiencia</h3>
          
          {editMode ? (
            <div className="edit-grid">
              <div className="edit-group">
                <label>Experiencia Laboral (años)</label>
                <input 
                  type="number" 
                  name="experiencia_laboral" 
                  value={editedData.experiencia_laboral || ''} 
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="edit-group">
                <label>Experiencia Docente (años)</label>
                <input 
                  type="number" 
                  name="experiencia_docente" 
                  value={editedData.experiencia_docente || ''} 
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="edit-group">
                <label>Categoría Docente</label>
                <input 
                  type="text" 
                  name="categoria_docente" 
                  value={editedData.categoria_docente || ''} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="edit-group">
                <label>Modalidad de Ingreso</label>
                <input 
                  type="text" 
                  name="modalidad_ingreso" 
                  value={editedData.modalidad_ingreso || ''} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Experiencia Laboral</span>
                  <span className="info-value">{docente.experiencia_laboral} años</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Experiencia Docente</span>
                  <span className="info-value">{docente.experiencia_docente} años</span>
                </div>
              </div>
              
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Categoría Docente</span>
                  <span className="info-value">{docente.categoria_docente || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Modalidad de Ingreso</span>
                  <span className="info-value">{docente.modalidad_ingreso || 'No especificado'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="info-card">
          <h3>Asignaturas</h3>
          
          {editMode ? (
            <div className="edit-group full-width">
              <textarea 
                name="asignaturas" 
                value={editedData.asignaturas || ''} 
                onChange={handleInputChange}
                placeholder="Ingrese las asignaturas separadas por saltos de línea"
                rows="5"
              ></textarea>
              <p className="help-text">Ingrese una asignatura por línea</p>
            </div>
          ) : (
            <div className="asignaturas-container">
              {docente.asignaturas ? (
                docente.asignaturas.split('\n').map((asignatura, index) => (
                  asignatura.trim() && (
                    <div className="asignatura-chip" key={index}>
                      {asignatura.trim()}
                    </div>
                  )
                ))
              ) : (
                <p className="no-data">No hay asignaturas registradas</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Modal para previsualizar certificados */}
    {certificadoPreview && (
      <div className="certificado-modal">
        <div className="certificado-modal-content">
          <button className="close-modal" onClick={closePreview}>×</button>
          <div className="certificado-preview">
            <img src={certificadoPreview} alt="Certificado" />
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default ResumenDocente;