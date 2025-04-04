import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/login/Login';
import Vadmin from './views/Vadmin';
import Vdocente from './views/Vdocente';

const App = () => {
  const [rol, setRol] = useState(localStorage.getItem('rol'));

  const actualizarRol = (nuevoRol) => {
    setRol(nuevoRol);
    console.log("🧠 Rol actual en App.jsx:", nuevoRol);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login actualizarRol={actualizarRol} />} />
        <Route path="/admin" element={rol === 'admin' ? <Vadmin actualizarRol={actualizarRol} /> : <Navigate to="/" />} />
        <Route path="/docente" element={rol === 'docente' ? <Vdocente actualizarRol={actualizarRol} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
