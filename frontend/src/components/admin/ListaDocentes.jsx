// src/components/admin/ListaDocentes.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ListaDocentes.css';

const ListaDocentes = ({ docentes, onDocenteClick, docenteSeleccionadoId }) => {
  const navigate = useNavigate();

  return (
    <div className="lista-docentes-container">
      <div className="table-responsive">
        <table className="docentes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Grado académico</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((docente, index) => (
              <tr key={docente.id} className={docenteSeleccionadoId === docente.id ? 'fila-activa' : ''}>
                <td>{index + 1}</td>
                <td>{docente.nombres} {docente.apellidos}</td>
                <td>{docente.correo_electronico}</td>
                <td>{docente.grado_academico || 'No especificado'}</td>
                <td>
                  <div className="botones-acciones">
                    <button
                      className="btn-ver"
                      onClick={() => onDocenteClick(docente.id)}
                    >
                      Ver
                    </button>
                    <button
                      className="btn-editar"
                      onClick={() => navigate(`/admin/docentes/editar/${docente.id}`)}
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaDocentes;
