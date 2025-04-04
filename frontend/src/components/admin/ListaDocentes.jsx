import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ListaDocentes.css';

const ListaDocentes = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [docentesPorPagina] = useState(10);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await axios.get('/api/docentes');
        setDocentes(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los docentes');
        setLoading(false);
        console.error('Error al obtener los docentes:', err);
      }
    };

    fetchDocentes();
  }, []);

  // Obtener docentes actuales (para paginación)
  const indexUltimoDocente = currentPage * docentesPorPagina;
  const indexPrimerDocente = indexUltimoDocente - docentesPorPagina;
  const docentesActuales = docentes.slice(indexPrimerDocente, indexUltimoDocente);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="lista-docentes-container">
      <h1>Administración de Docentes</h1>
      
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Buscar docente..." 
          className="search-input"
          // Aquí puedes implementar la funcionalidad de búsqueda
        />
      </div>

      <div className="table-container">
        <table className="docentes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentesActuales.length > 0 ? (
              docentesActuales.map((docente) => (
                <tr key={docente._id}>
                  <td>{docente.nombre}</td>
                  <td>{docente.apellido}</td>
                  <td>{docente.correo}</td>
                  <td>{docente.departamento}</td>
                  <td>
                    <span className={`status ${docente.estado?.toLowerCase()}`}>
                      {docente.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/docentes/${docente._id}`} className="view-btn">
                        Ver
                      </Link>
                      <button 
                        className="edit-btn"
                        onClick={() => window.location.href = `/admin/docentes/editar/${docente._id}`}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No hay docentes registrados</td>
              </tr>
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