import React, { useState } from "react";
import logo1 from "../imagenes/logo1.jpg";
import logo2 from "../imagenes/logo2.png";
import logo3 from "../imagenes/logo3.jpg";
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/eliminarusuario.css';

function EliminarUsuario() {
  const usuarios = [
    { nombre: "Juan", apellidop: "Pérez" , apellidom:"Torres"},
    { nombre: "María", apellidop: "Gómez",apellidom:"Torres" },
    { nombre: "Luis", apellidop: "Ramírez",apellidom:"Torres" },
    { nombre: "Ana", apellidop: "López",apellidom:"Torres" },
    { nombre: "Carlos", apellidop: "Sánchez",apellidom:"Torres" },
    { nombre: "Sofía", apellidop: "Hernández" ,apellidom:"Torres"},
    { nombre: "Miguel", apellidop: "Torres",apellidom:"Torres" },
    { nombre: "Lucía", apellidop: "Fernández",apellidom:"Torres" },
    { nombre: "Pedro", apellidop: "Morales" ,apellidom:"Torres"},
    { nombre: "Isabel", apellidop: "Jiménez" ,apellidom:"Torres"},
    { nombre: "Salvador", apellidop: "García", apellidom: "Torres" },
    { nombre: "Verónica", apellidop: "Luna", apellidom: "Torres" }
  ];

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [eliminados, setEliminados] = useState([]);
  const [usuarioEliminado, setUsuarioEliminado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const usuariosPorPagina = 5;

  const usuariosFiltrados = usuarios.filter(u => {
    const nombreCompleto = `${u.nombre} ${u.apellidop} ${u.apellidom}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  const indexUltimoUsuario = paginaActual * usuariosPorPagina;
  const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const cambiarPagina = (num) => setPaginaActual(num);

  const eliminarUsuario = (usuario) => {
    if (!eliminados.includes(usuario)) {
      setEliminados([...eliminados, usuario]);
      setUsuarioEliminado(`${usuario.nombre} ${usuario.apellidop} ${usuario.apellidom}`);
      setMostrarModal(true);
      setTimeout(() => setMostrarModal(false), 2000);
    }
  };

  return (
    <div className="app eliminarusuario-app">
      {/* Encabezado */}
      <div className="eliminarusuario-encabezado">
        <div className="eliminarusuario-contenedor">
          <img src={logo1} alt="Logo 1" className="eliminarusuario-logo" />
          <div className="eliminarusuario-separador"></div>
          <img src={logo2} alt="Logo central" className="eliminarusuario-logo-central" />
          <div className="eliminarusuario-separador"></div>
          <img src={logo3} alt="Logo 3" className="eliminarusuario-logo" />
        </div>
        <div className="eliminarusuario-barra">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="eliminarusuario-icono-casa">
            <path d="M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8z" />
          </svg>
          <span className="eliminarusuario-titulo-barra">GESTIÓN DE USUARIOS</span>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="eliminarusuario-contenedor-principal">
        <div className="eliminarusuario-contenedor-usuarios">
          <h1>Usuarios no asignados</h1>

          <div className="eliminarusuario-busqueda">
            <input 
              className="eliminarusuario-input" 
              placeholder="Buscar usuarios" 
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
            />
            <button className="eliminarusuario-boton-buscar">Buscar</button>
          </div>

          <ul className="eliminarusuario-lista-usuarios">
            {usuariosPaginados.length > 0 ? usuariosPaginados.map((usuario, index) => (
              <li key={index}>
                {`${usuario.nombre} ${usuario.apellidop} ${usuario.apellidom}`}
                <button 
                  className="eliminarusuario-boton-eliminar"
                  onClick={() => eliminarUsuario(usuario)}
                >
                  Eliminar
                </button>
              </li>
            )) : (
              <li style={{ textAlign: "center", width: "100%", color: "#861542" }}>
                El usuario que buscas ya se encuentra registrado en un departamento
              </li>
            )}
          </ul>

          {usuariosFiltrados.length > usuariosPorPagina && (
            <div className="eliminarusuario-paginacion">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => cambiarPagina(i + 1)}
                  className={paginaActual === i + 1 ? "eliminarusuario-activo" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {eliminados.length > 0 && (
            <div className="eliminarusuario-usuarios-eliminados">
              <h2>Usuarios eliminados</h2>
              <ul>
                {eliminados.map((u, i) => (
                  <li key={i}>{`${u.nombre} ${u.apellidop} ${u.apellidom}`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="eliminarusuario-modal">
          <div className="eliminarusuario-modal-contenido">
            <span className="eliminarusuario-cerrar" onClick={() => setMostrarModal(false)}>
              <i className="fas fa-times"></i>
            </span>

            <div className="eliminarusuario-icono-basura">
              <i className="fas fa-trash-alt"></i>
            </div>

            <p className="eliminarusuario-mensaje-eliminado">
              Usuario eliminado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EliminarUsuario;


