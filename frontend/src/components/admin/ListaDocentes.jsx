// src/pages/ListaDocentes.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ListaDocentes.css';

const ListaDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [docentesPorPagina] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/docentes');
        setDocentes(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los docentes');
        setLoading(false);
        console.error('❌ Error en fetchDocentes:', err);
      }
    };

    fetchDocentes();
  }, []);

  const indexUltimoDocente = currentPage * docentesPorPagina;
  const indexPrimerDocente = indexUltimoDocente - docentesPorPagina;
  const docentesActuales = docentes.slice(indexPrimerDocente, indexUltimoDocente);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="lista-docentes-container">
      <h1>Administración de Docentes</h1>

      <div className="table-responsive">
        <table className="docentes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Grado académico</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentesActuales.length > 0 ? (
              docentesActuales.map((docente, index) => (
                <tr key={docente.id}>
                  <td>{indexPrimerDocente + index + 1}</td>
                  <td>{docente.nombres} {docente.apellidos}</td>
                  <td>{docente.correo_electronico}</td>
                  <td>{docente.grado_academico || 'No especificado'}</td>
                  <td>
                    <span className="badge badge-pendiente">Pendiente</span>
                  </td>
                  <td>
                    <div className="botones-acciones">
                      <button
                        className="btn-ver"
                        onClick={() => navigate(`/admin/docentes/${docente.id}`)}
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
              ))
            ) : (
              <tr><td colSpan="6">No hay docentes registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {docentes.length > docentesPorPagina && (
        <div className="pagination">
          {Array.from({ length: Math.ceil(docentes.length / docentesPorPagina) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaDocentes;
