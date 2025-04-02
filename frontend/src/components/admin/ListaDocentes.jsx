import React from 'react';
import './ListaDocentes.css';

const ListaDocentes = ({ docentes, onDocenteClick, docenteSeleccionadoId }) => {
  return (
    <div className="lista-docentes">
      {docentes.length === 0 ? (
        <p>No hay docentes registrados</p>
      ) : (
        <ul className="docentes-list">
          {docentes.map(docente => (
            <li 
              key={docente.id} 
              className={`docente-item ${docente.id === docenteSeleccionadoId ? 'selected' : ''}`}
              onClick={() => onDocenteClick(docente.id)}
            >
              <div className="docente-avatar">
                {docente.fotografia ? (
                  <img 
                    src={`http://localhost:5000/uploads/fotosDocentes/${docente.fotografia}`} 
                    alt={`${docente.nombre} ${docente.apellidos}`} 
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {docente.nombre.charAt(0)}{docente.apellidos.charAt(0)}
                  </div>
                )}
              </div>
              <div className="docente-info">
                <h3>{docente.nombre} {docente.apellidos}</h3>
                <p>{docente.correo}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListaDocentes;