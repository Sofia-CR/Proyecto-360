import React, { useState } from 'react';
import '../css/App.css';
import logo1 from '../imagenes/logo1.png';
import logo2 from '../imagenes/logo2.png';
import logo3 from '../imagenes/logo3.png';
import { Link } from 'react-router-dom';

function CambiaContrasena() {
  const [codigo, setCodigo] = useState('');

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-logos">
          <img src={logo3} alt="Logo3" className="login-logo3" />
          <img src={logo1} alt="Logo1" className="login-logo1" />
          <img src={logo2} alt="Logo2" className="login-logo2" />
        </div>

        <h1 className="login-title">INGRESA CÓDIGO</h1>

        <div className="login-campo">
          <label htmlFor="codigo">Código:</label>
          <div className="login-input-contenedor">
            <input
              type="password"
              id="codigo"
              placeholder="Ingresa tu código"
              className="login-input"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="login-button">
          CONTINUAR
        </button>

        <h2 className="login-campo">
          <Link to="/">Volver al inicio</Link>
        </h2>
      </div>
    </div>
  );
}

export default CambiaContrasena;
