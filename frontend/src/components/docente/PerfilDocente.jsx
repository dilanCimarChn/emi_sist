import React, { useState } from 'react';
import axios from 'axios';
import './PerfilDocente.css';

const PerfilDocente = ({ docente, modoEdicion, setModoEdicion, onUpdate }) => {
  const [formData, setFormData] = useState({
    nombres: docente?.nombres || '',
    apellidos: docente?.apellidos || '',
    correo_electronico: docente?.correo_electronico || '',
    ci: docente?.ci || '',
    genero: docente?.genero || '',
    grado_academico: docente?.grado_academico || '',
    titulo: docente?.titulo || '',
    anio_titulacion: docente?.anio_titulacion || '',
    universidad: docente?.universidad || '',
    diplomado_competencias: docente?.diplomado_competencias || false,
    dipl_comp_ano: docente?.dipl_comp_ano || '',
    dipl_comp_univ: docente?.dipl_comp_univ || '',
    maestria: docente?.maestria || false,
    msc_ano: docente?.msc_ano || '',
    msc_univ: docente?.msc_univ || '',
    phd: docente?.phd || false,
    phd_ano: docente?.phd_ano || '',
    phd_univ: docente?.phd_univ || '',
    pos_phd: docente?.pos_phd || false,
    pos_phd_ano: docente?.pos_phd_ano || '',
    pos_phd_univ: docente?.pos_phd_univ || '',
    experiencia_laboral: docente?.experiencia_laboral || 0,
    experiencia_docente: docente?.experiencia_docente || 0,
    categoria_docente: docente?.categoria_docente || '',
    modalidad_ingreso: docente?.modalidad_ingreso || ''
  });

  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(
    docente?.fotografia ? `http://localhost:5000/uploads/fotosDocentes/${docente.fotografia}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Actualizar datos del docente
      await axios.put(
        `http://localhost:5000/api/docentes/${docente.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Si hay una nueva foto, subirla
      if (foto) {
        const formDataFoto = new FormData();
        formDataFoto.append('foto', foto);
        
        await axios.post(
          `http://localhost:5000/api/docentes/${docente.id}/foto`,
          formDataFoto,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      // Obtener datos actualizados
      const response = await axios.get(
        `http://localhost:5000/api/docentes/${docente.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      onUpdate(response.data);
      setSuccess('Datos actualizados correctamente');
      setModoEdicion(false);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      setError('Error al actualizar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil-container">
      {error && <div className="perfil-error">{error}</div>}
      {success && <div className="perfil-success">{success}</div>}
      
      <div className="perfil-foto-container">
        {fotoPreview ? (
          <img src={fotoPreview} alt="Foto de perfil" className="perfil-foto" />
        ) : (
          <div className="perfil-foto-placeholder">
            <span>Sin foto</span>
          </div>
        )}
        
        {modoEdicion && (
          <div className="perfil-foto-upload">
            <label htmlFor="foto-upload" className="foto-upload-label">
              Cambiar foto
            </label>
            <input
              type="file"
              id="foto-upload"
              onChange={handleFotoChange}
              accept="image/*"
              className="foto-upload-input"
            />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="perfil-form">
        <div className="form-section">
          <h3>Datos Personales</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nombres</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.nombres}</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Apellidos</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.apellidos}</p>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Correo Electrónico</label>
              {modoEdicion ? (
                <input
                  type="email"
                  name="correo_electronico"
                  value={formData.correo_electronico}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.correo_electronico}</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Cédula de Identidad</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.ci}</p>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Género</label>
              {modoEdicion ? (
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              ) : (
                <p>
                  {formData.genero === 'masculino' ? 'Masculino' : 
                   formData.genero === 'femenino' ? 'Femenino' : 
                   formData.genero === 'otro' ? 'Otro' : 'No especificado'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Sección de Formación Académica */}
        <div className="form-section">
          <h3>Formación Académica</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Grado Académico</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="grado_academico"
                  value={formData.grado_academico}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.grado_academico}</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Título</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.titulo}</p>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Año de Titulación</label>
              {modoEdicion ? (
                <input
                  type="number"
                  name="anio_titulacion"
                  value={formData.anio_titulacion}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.anio_titulacion}</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Universidad</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="universidad"
                  value={formData.universidad}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.universidad}</p>
              )}
            </div>
          </div>
          
          {/* Diplomado en Competencias */}
          <div className="form-checkbox-section">
            <div className="form-checkbox-header">
              {modoEdicion ? (
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="diplomado_competencias"
                    checked={formData.diplomado_competencias}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Diplomado en Competencias</span>
                </label>
              ) : (
                <h4>Diplomado en Competencias: {formData.diplomado_competencias ? 'Sí' : 'No'}</h4>
              )}
            </div>
            
            {formData.diplomado_competencias && (
              <div className="form-row">
                <div className="form-group">
                  <label>Año</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      name="dipl_comp_ano"
                      value={formData.dipl_comp_ano}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.dipl_comp_ano}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Universidad</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      name="dipl_comp_univ"
                      value={formData.dipl_comp_univ}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.dipl_comp_univ}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Maestría */}
          <div className="form-checkbox-section">
            <div className="form-checkbox-header">
              {modoEdicion ? (
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="maestria"
                    checked={formData.maestria}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Maestría</span>
                </label>
              ) : (
                <h4>Maestría: {formData.maestria ? 'Sí' : 'No'}</h4>
              )}
            </div>
            
            {formData.maestria && (
              <div className="form-row">
                <div className="form-group">
                  <label>Año</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      name="msc_ano"
                      value={formData.msc_ano}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.msc_ano}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Universidad</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      name="msc_univ"
                      value={formData.msc_univ}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.msc_univ}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Doctorado */}
          <div className="form-checkbox-section">
            <div className="form-checkbox-header">
              {modoEdicion ? (
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="phd"
                    checked={formData.phd}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Doctorado (PhD)</span>
                </label>
              ) : (
                <h4>Doctorado: {formData.phd ? 'Sí' : 'No'}</h4>
              )}
            </div>
            
            {formData.phd && (
              <div className="form-row">
                <div className="form-group">
                  <label>Año</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      name="phd_ano"
                      value={formData.phd_ano}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.phd_ano}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Universidad</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      name="phd_univ"
                      value={formData.phd_univ}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.phd_univ}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Post-Doctorado */}
          <div className="form-checkbox-section">
            <div className="form-checkbox-header">
              {modoEdicion ? (
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="pos_phd"
                    checked={formData.pos_phd}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Post-Doctorado</span>
                </label>
              ) : (
                <h4>Post-Doctorado: {formData.pos_phd ? 'Sí' : 'No'}</h4>
              )}
            </div>
            
            {formData.pos_phd && (
              <div className="form-row">
                <div className="form-group">
                  <label>Año</label>
                  {modoEdicion ? (
                    <input
                      type="number"
                      name="pos_phd_ano"
                      value={formData.pos_phd_ano}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.pos_phd_ano}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Universidad</label>
                  {modoEdicion ? (
                    <input
                      type="text"
                      name="pos_phd_univ"
                      value={formData.pos_phd_univ}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData.pos_phd_univ}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sección de Experiencia */}
        <div className="form-section">
          <h3>Experiencia</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Experiencia Laboral (años)</label>
              {modoEdicion ? (
                <input
                  type="number"
                  name="experiencia_laboral"
                  value={formData.experiencia_laboral}
                  onChange={handleChange}
                  min="0"
                  required
                />
              ) : (
                <p>{formData.experiencia_laboral}</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Experiencia Docente (años)</label>
              {modoEdicion ? (
                <input
                  type="number"
                  name="experiencia_docente"
                  value={formData.experiencia_docente}
                  onChange={handleChange}
                  min="0"
                  required
                />
              ) : (
                <p>{formData.experiencia_docente}</p>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Categoría Docente</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="categoria_docente"
                  value={formData.categoria_docente}
                  onChange={handleChange}
                  maxLength="1"
                  required
                />
              ) : (
                <p>{formData.categoria_docente}</p>
              )}
            </div>
            
            <div className="form-group">
              <label>Modalidad de Ingreso</label>
              {modoEdicion ? (
                <input
                  type="text"
                  name="modalidad_ingreso"
                  value={formData.modalidad_ingreso}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p>{formData.modalidad_ingreso}</p>
              )}
            </div>
          </div>
        </div>
        
        {modoEdicion && (
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setModoEdicion(false)}>
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PerfilDocente;