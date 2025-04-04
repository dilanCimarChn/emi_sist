// src/components/admin/ListaDocentes.jsx
import React from 'react';
import './ListaDocentes.css';

const ListaDocentes = ({ docentes, onDocenteClick, docenteSeleccionadoId }) => {
  return (
    <ul className="lista-docentes-simple">
      {docentes.map((docente) => (
        <li
          key={docente.id}
          onClick={() => onDocenteClick(docente.id)}
          className={docenteSeleccionadoId === docente.id ? 'seleccionado' : ''}
        >
          {docente.nombres} {docente.apellidos}
        </li>
      ))}
    </ul>
  );
};

export default ListaDocentes;
