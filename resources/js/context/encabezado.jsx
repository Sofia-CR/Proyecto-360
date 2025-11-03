<div className="proyectos-encabezado">
        <div className="proyectos-contenedor">
          <img src={logo1} alt="logo1" className="proyectos-logo" />
          <div className="proyectos-separador"></div>
          <img src={logo2} alt="logo2" className="proyectos-logo-central" />
          <div className="proyectos-separador"></div>
          <img src={logo3} alt="logo3" className="proyectos-logo" />
        </div>

        <div className="proyectos-barra">
          <div className="proyectos-contenedor-icono" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="proyectos-icono-casa"
            >
              <path d="M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8z" />
            </svg>
          </div>
          <span className="proyectos-titulo-barra">GESTIÓN DE PROYECTOS</span>
          {isOpen && (
            <ul className="proyectos-sub-menu d-none d-md-block">
              <li onClick={() => navigate("/")}>INICIO</li>
              <li onClick={() => navigate("/nuevoproyecto")}>NUEVO PROYECTO</li>
              <li onClick={() => navigate("/Contenedor")}>CERRAR SESIÓN</li>
              <li onClick={() => navigate("/reportes")}>REPORTES</li>
            </ul>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="proyectos-sub-menu-container d-md-none">
          <button className="proyectos-cerrar-menu" onClick={toggleMenu}>
            &times;
          </button>
          <ul className="proyectos-sub-menu-mobile">
            <li>
              <Link to="/" onClick={toggleMenu}>INICIO</Link>
            </li>
            <li>
              <Link to="/nuevoproyecto" onClick={toggleMenu}>NUEVO PROYECTO</Link>
            </li>
            <li>
              <Link to="/" onClick={toggleMenu}>CERRAR SESIÓN</Link>
            </li>
          </ul>
        </div>
      )}