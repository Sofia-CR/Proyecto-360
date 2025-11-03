import React from 'react';
import '../css/Home.css';
import logo1 from '../imagenes/logo1.png';
import logo2 from '../imagenes/logo2.png';
import logo3 from '../imagenes/logo3.png';

function Home() {
  return (
    <div className="home-app">
      {/* Encabezado con logos */}
      <div className="home-encabezado">
        <div className="home-contenedor">
          <img src={logo3} alt="logo1" className="home-logo" />
          <div className="home-separador"></div>
          <img src={logo1} alt="logo2" className="home-logo-central" />
          <div className="home-separador"></div>
          <img src={logo2} alt="logo3" className="home-logo" />
        </div>

        {/* Barra de título */}
        <div className="home-barra">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="home-icono-casa">
            <path d="M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8z" />
          </svg>
          <span className="home-proyectos-titulo-barra">DEPARTAMENTOS</span>
        </div>
      </div>
    </div>
  );
}

export default Home;
