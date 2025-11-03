import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import logo3 from "../imagenes/logo3.png";
import "../css/EliminarProyectos.css";
import { FaAngleDown, FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import { FiSearch, FiX, FiTrash2, FiAlertTriangle, FiFolder, FiClock } from "react-icons/fi";

function EliminarProyectos() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("alfabetico");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const handleClickOutside = (event) => {
    const contenedor = document.querySelector(".eliminar-proyectos-filtro-contenedor");
    if (contenedor && !contenedor.contains(event.target)) {
      setOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuario?.id_usuario;
    if (!idUsuario) return;

    fetch(`http://127.0.0.1:8000/api/proyectos/usuario?usuario=${idUsuario}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProyectos(data.proyectos || []);
        } else {
          console.error("Error al cargar proyectos:", data.mensaje);
        }
      })
      .catch((err) => console.error("Error al cargar proyectos:", err))
      .finally(() => setLoading(false));
  }, []);

  const confirmarEliminacion = (proyecto) => {
    setProyectoAEliminar(proyecto);
    setShowModal(true);
  };

  const eliminarProyecto = () => {
    if (!proyectoAEliminar) return;
    
    setEliminando(true);
    
    fetch(`http://127.0.0.1:8000/api/proyectos/${proyectoAEliminar.id_proyecto}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setProyectos(proyectos.filter(p => p.id_proyecto !== proyectoAEliminar.id_proyecto));
        setShowModal(false);
        setProyectoAEliminar(null);
      } else {
        console.error("Error al eliminar proyecto:", data.mensaje);
      }
    })
    .catch(err => console.error("Error al eliminar:", err))
    .finally(() => setEliminando(false));
  };

  const proyectosFiltrados = proyectos
    .filter((p) => p.p_nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      switch (filtro) {
        case "alfabetico":
          return a.p_nombre.localeCompare(b.p_nombre);
        case "alfabetico_desc":
          return b.p_nombre.localeCompare(a.p_nombre);
        case "fecha_proxima":
          return new Date(a.pf_fin) - new Date(b.pf_fin);
        case "fecha_lejana":
          return new Date(b.pf_fin) - new Date(a.pf_fin);
        default:
          return 0;
      }
    });

  const opciones = [
    { value: "alfabetico", label: "Nombre (A-Z)" },
    { value: "alfabetico_desc", label: "Nombre (Z-A)" },
    { value: "fecha_proxima", label: "Fecha más próxima" },
    { value: "fecha_lejana", label: "Fecha más lejana" },
  ];

  const mostrarSelect = busqueda.length === 0 || proyectosFiltrados.length > 0;

  const calcularDiasRestantes = (fechaFin) => {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const diffTime = fin - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} día(s) restantes`;
  } else if (diffDays === 0) {
    return "Vence hoy";
  } else {
    return `Venció hace ${Math.abs(diffDays)} día(s)`;
  }
};
  return (
    <div className="eliminar-proyectos-app">
      <Header />
        <h1 className="form-titulo">Eliminar Proyectos</h1>

      {/* Barra de búsqueda y filtros */}
      <div className="eliminar-proyectos-controls">
        <div className="eliminar-proyectos-buscador-contenedor">
          <div className="eliminar-proyectos-buscador-inner">
            <FiSearch className="eliminar-proyectos-buscador-icono" />
            <input
              type="text"
              placeholder="Buscar proyectos por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="eliminar-proyectos-buscador-input"
            />
            {busqueda && (
              <button
                className="eliminar-proyectos-buscador-clear"
                onClick={() => setBusqueda("")}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {busqueda && (
          <div className="eliminar-proyectos-resultados-info">
            {proyectos.filter((p) =>
              p.p_nombre.toLowerCase().includes(busqueda.toLowerCase())
            ).length}{" "}
            resultado(s) para "{busqueda}"
          </div>
        )}

      {mostrarSelect && (
  <div className="eliminar-proyectos-filtro-contenedor">
    <div
      className="eliminar-proyectos-filtro-select"
      onClick={() => setOpen(!open)}
    >
      <span>{opciones.find((o) => o.value === filtro)?.label}</span>
      <FaAngleDown className={`eliminar-proyectos-filtro-icon ${open ? "open" : ""}`} />
    </div>

    {open && (
      <div className="eliminar-proyectos-filtro-options">
        {opciones.map((o) => (
          <div
            key={o.value}
            className="eliminar-proyectos-filtro-option"
            onClick={() => {
              setFiltro(o.value);
              setOpen(false);
            }}
          >
            {o.label}
          </div>
        ))}
      </div>
    )}
  </div>
)}

      </div>

      {/* Lista de proyectos */}
      <div className="eliminar-proyectos-lista">
        {loading ? (
            <div className="loader-container">
              <div className="loader-logo">
                <img src={logo3} alt="Cargando" />
              </div>
              <div className="loader-texto">CARGANDO...</div>
              <div className="loader-spinner"></div>
            </div>
        ) : proyectos.length === 0 ? (
          <div className="eliminar-proyectos-estado-vacio">
            <FiFolder className="eliminar-proyectos-icono-vacio" />
            <h3>No hay proyectos disponibles</h3>
            <p>No se encontraron proyectos para eliminar</p>
          </div>
        ) : proyectosFiltrados.length > 0 ? (
          proyectosFiltrados.map((p) => {
            const diasRestantes = calcularDiasRestantes(p.pf_fin);
            const esUrgente = diasRestantes <= 7;
            
            return (
              <div key={p.id_proyecto} className="eliminar-proyectos-card">
                <div className="eliminar-proyectos-card-header">
                  <h3 className="eliminar-proyectos-card-titulo">{p.p_nombre}</h3>
                  {esUrgente && (
                    <div className="eliminar-proyectos-card-urgente">
                      <FaExclamationTriangle />
                      <span>Urgente</span>
                    </div>
                  )}
                </div>
                
                <div className="eliminar-proyectos-card-info">
                  <div className="eliminar-proyectos-card-fecha">
                    <FaCalendarAlt className="eliminar-proyectos-card-icono" />
                    <span>Fecha fin: {p.pf_fin}</span>
                  </div>
                  <div className={`eliminar-proyectos-card-dias ${esUrgente ? 'urgente' : ''}`}>
  <FiClock className="eliminar-proyectos-card-icono" />
  <span>{calcularDiasRestantes(p.pf_fin)}</span>
</div>

                </div>
                
                <div className="eliminar-proyectos-card-acciones">
                  <button
                    className="eliminar-proyectos-btn-eliminar"
                    onClick={() => confirmarEliminacion(p)}
                  >
                    <FiTrash2 className="eliminar-proyectos-btn-icono" />
                    Eliminar Proyecto
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="eliminar-proyectos-estado-vacio">
            <FiFolder className="eliminar-proyectos-icono-vacio" />
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="eliminar-proyectos-modal-overlay">
          <div className="eliminar-proyectos-modal">
            <div className="eliminar-proyectos-modal-header">
              <FiAlertTriangle className="eliminar-proyectos-modal-icon" />
              <h3>Confirmar Eliminación</h3>
            </div>
            
            <div className="eliminar-proyectos-modal-content">
              <p>¿Estás seguro de que deseas eliminar el proyecto?</p>
              <div className="eliminar-proyectos-modal-proyecto">
                <strong>{proyectoAEliminar?.p_nombre}</strong>
              </div>
              <p className="eliminar-proyectos-modal-advertencia">
                Esta acción no se puede deshacer y se perderán todos los datos del proyecto.
              </p>
            </div>
            
            <div className="eliminar-proyectos-modal-botones">
              <button 
                className="eliminar-proyectos-modal-btn eliminar-proyectos-modal-btn-cancelar"
                onClick={() => setShowModal(false)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button 
                className="eliminar-proyectos-modal-btn eliminar-proyectos-modal-btn-confirmar"
                onClick={eliminarProyecto}
                disabled={eliminando}
              >
                {eliminando ? (
                  <div className="eliminar-proyectos-spinner-mini"></div>
                ) : (
                  <>
                    <FiTrash2 />
                    Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EliminarProyectos;