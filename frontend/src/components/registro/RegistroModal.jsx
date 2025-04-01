import React, { useState } from 'react';
import axios from 'axios';
import './RegistroModal.css';

const RegistroModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        celular: '',
        ci: ''
    });
    
    const [verContrasena, setVerContrasena] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Limpiar error específico al cambiar un campo
        if (fieldErrors[name]) {
            const updatedErrors = {...fieldErrors};
            delete updatedErrors[name];
            setFieldErrors(updatedErrors);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setFieldErrors({});
        setLoading(true);
        
        // Validaciones
        let hasError = false;
        const errors = {};
        
        if (formData.contrasena.length < 6) {
            errors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
            hasError = true;
        }
        
        if (formData.contrasena !== formData.confirmarContrasena) {
            errors.confirmarContrasena = 'Las contraseñas no coinciden';
            hasError = true;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.correo)) {
            errors.correo = 'Por favor, ingrese un correo electrónico válido';
            hasError = true;
        }
        
        if (!formData.celular || !/^\d{8}$/.test(formData.celular)) {
            errors.celular = 'Por favor, ingrese un número de celular válido (8 dígitos)';
            hasError = true;
        }
        
        if (!formData.ci) {
            errors.ci = 'Por favor, ingrese su número de CI';
            hasError = true;
        }
        
        if (hasError) {
            setFieldErrors(errors);
            setLoading(false);
            return;
        }
        
        try {
            const res = await axios.post(
                'http://localhost:5000/api/auth/solicitar-registro',
                {
                    nombre: formData.nombre,
                    apellidos: formData.apellidos,
                    correo: formData.correo,
                    contrasena: formData.contrasena,
                    celular: formData.celular,
                    ci: formData.ci
                },
                {
                    timeout: 8000,
                    validateStatus: (status) => status >= 200 && status < 500
                }
            );
            
            if (res.status === 201) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                setGeneralError(res.data.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            setGeneralError(
                error.response?.data?.message ||
                'Error de conexión. Por favor, intente nuevamente.'
            );
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Solicitud de Acceso como Docente</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <div className="modal-body">
                    {success ? (
                        <div className="success-message">
                            <p>Tu solicitud ha sido enviada correctamente.</p>
                            <p>El administrador revisará tu información y te notificará cuando tu cuenta sea activada.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {generalError && <div className="form-error">{generalError}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className={fieldErrors.nombre ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.nombre && (
                                    <div className="field-error">{fieldErrors.nombre}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="apellidos">Apellidos</label>
                                <input
                                    type="text"
                                    id="apellidos"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    className={fieldErrors.apellidos ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.apellidos && (
                                    <div className="field-error">{fieldErrors.apellidos}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="correo">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="correo"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    className={fieldErrors.correo ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.correo && (
                                    <div className="field-error">{fieldErrors.correo}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="ci">Cédula de Identidad</label>
                                <input
                                    type="text"
                                    id="ci"
                                    name="ci"
                                    value={formData.ci}
                                    onChange={handleChange}
                                    className={fieldErrors.ci ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.ci && (
                                    <div className="field-error">{fieldErrors.ci}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="celular">Número de Celular</label>
                                <input
                                    type="text"
                                    id="celular"
                                    name="celular"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    className={fieldErrors.celular ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.celular && (
                                    <div className="field-error">{fieldErrors.celular}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="contrasena">Contraseña</label>
                                <div className="password-input-container">
                                    <input
                                        type={verContrasena ? 'text' : 'password'}
                                        id="contrasena"
                                        name="contrasena"
                                        value={formData.contrasena}
                                        onChange={handleChange}
                                        className={fieldErrors.contrasena ? "input-error" : ""}
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
                                {fieldErrors.contrasena && (
                                    <div className="field-error">{fieldErrors.contrasena}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="confirmarContrasena">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmarContrasena"
                                    name="confirmarContrasena"
                                    value={formData.confirmarContrasena}
                                    onChange={handleChange}
                                    className={fieldErrors.confirmarContrasena ? "input-error" : ""}
                                    required
                                />
                                {fieldErrors.confirmarContrasena && (
                                    <div className="field-error">{fieldErrors.confirmarContrasena}</div>
                                )}
                            </div>
                            
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={onClose}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistroModal;