import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHome } from 'react-icons/fa';
import logo1 from "../imagenes/logo1.jpg";
import logo2 from "../imagenes/logo2.png";
import logo3 from "../imagenes/logo3.jpg";
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../css/agregarusuario.css';

function AgregarUsuario() {
  const [usuarios, setUsuarios] = useState([]); 
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [agregados, setAgregados] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const usuariosPorPagina = 5;

  const toggleMenu = () => setIsOpen(!isOpen);
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/usuarios")
      .then(res => {
        console.log(res.data);
        setUsuarios(res.data);
      })
      .catch(err => {
        console.error("Error al obtener usuarios:", err);
      });
  }, []);

  const usuariosFiltrados = usuarios.filter(u => {
    const nombreCompleto = `${u.u_nombre} ${u.a_paterno} ${u.a_materno}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  const indexUltimoUsuario = paginaActual * usuariosPorPagina;
  const indexPrimerUsuario = indexUltimoUsuario - usuariosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indexPrimerUsuario, indexUltimoUsuario);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const cambiarPagina = (num) => setPaginaActual(num);

  const agregarUsuario = (usuario) => {
    if (!agregados.includes(usuario)) {
      setAgregados([...agregados, usuario]);
      setMostrarModal(true);
      setTimeout(() => setMostrarModal(false), 2000);
    }
  };

  return (
    <div className="agregarusuario-app">
      <div className="agregarusuario-encabezado">
        <div className="agregarusuario-contenedor">
          <img src={logo1} alt="Logo 1" className="agregarusuario-logo" />
          <div className="agregarusuario-separador"></div>
          <img src={logo2} alt="Logo central" className="agregarusuario-logo-central" />
          <div className="agregarusuario-separador"></div>
          <img src={logo3} alt="Logo 3" className="agregarusuario-logo"/>
        </div>

        <div className="agregarusuario-barra">
          <div className="agregarusuario-contenedor-icono">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="agregarusuario-icono-casa" onClick={toggleMenu}>
            <path d="M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8z" />
          </svg>
          </div>
          <span className="agregarusuario-titulo-barra">GESTIÓN DE USUARIOS</span>
          {isOpen && (
            <ul className="agregarusuario-sub-menu">
              <li><a href="#">INICIO</a></li>
              <li><a href="#">PERFIL</a></li>
              <li><a href="#">REPORTES</a></li>
              <li><a href="#">CERRAR SESIÓN</a></li>
            </ul>
          )}
        </div>
      </div>

      <div className="agregarusuario-contenedor-principal">
        <div className="agregarusuario-contenedor-usuarios">
          <h1>Usuarios no asignados</h1>

          {/* Buscador */}
          <div className="agregarusuario-busqueda">
            <input 
              className="agregarusuario-input" 
              placeholder="Buscar usuarios" 
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
            />
            <button className="agregarusuario-boton-buscar">Buscar</button>
          </div>

          {/* Lista de usuarios */}
          <ul className="agregarusuario-lista-usuarios">
            {usuariosPaginados.length > 0 ? (
              usuariosPaginados.map((usuario) => (
                <li key={usuario.id_usuario}>
                  {`${usuario.u_nombre} ${usuario.a_paterno} ${usuario.a_materno}`}
                  <button 
                    className="agregarusuario-boton-agregar"
                    onClick={() => agregarUsuario(usuario)}
                  >
                    Agregar
                  </button>
                </li>
              ))
            ) : (
              <li style={{ textAlign: "center", width: "100%", color: "#861542" }}>
                No se encontraron usuarios
              </li>
            )}
          </ul>

          {/* Paginación */}
          {usuariosFiltrados.length > usuariosPorPagina && (
            <div className="agregarusuario-paginacion">
              {Array.from({ length: totalPaginas }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => cambiarPagina(i + 1)}
                  className={paginaActual === i + 1 ? "activo" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Usuarios agregados */}
          {agregados.length > 0 && (
            <div className="agregarusuario-usuarios-agregados">
              <h2>Usuarios agregados</h2>
              <ul>
                {agregados.map((u) => (
                  <li key={u.id_usuario}>
                    {`${u.u_nombre} ${u.a_paterno} ${u.a_materno}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {mostrarModal && (
        <div className="agregarusuario-modal">
          <div className="agregarusuario-modal-contenido">
            <span className="agregarusuario-cerrar" onClick={() => setMostrarModal(false)}>
              <i className="fas fa-times"></i>
            </span>

            <div className="agregarusuario-icono-palomita">
              <i className="fas fa-check"></i>
            </div>

            <p className="agregarusuario-mensaje-agregado">
              Usuario agregado
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default AgregarUsuario;















