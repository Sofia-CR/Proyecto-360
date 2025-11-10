import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo3 from "../imagenes/logo3.png";
import '../css/global.css';
import "../css/ModificarTareas.css";
import { FaClock, FaBars } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";
import MenuDinamico from "../components/MenuDinamico";

function ModificarTareas() {
  const navigate = useNavigate(); 
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // 🚀 Fetch de proyectos y tareas
  useEffect(() => {
    const fetchTareasPorProyecto = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario?.id_usuario) return;

        const res = await fetch(
  `http://127.0.0.1:8000/api/tareasPorDepartamento?usuario=${usuario.id_usuario}`
);

        const data = await res.json();

        if (data.success) {
          setProyectos(data.proyectos);
        } else {
          console.error("Error al cargar proyectos y tareas:", data.mensaje);
        }
      } catch (error) {
        console.error("Error al cargar proyectos y tareas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTareasPorProyecto();
  }, []);

  // 🔍 Filtrado de proyectos y tareas
  const proyectosFiltrados = proyectos
    .map(({ proyecto, tareas }) => {
      const proyectoCoincide = proyecto.p_nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const tareasFiltradas = proyectoCoincide
        ? tareas
        : tareas.filter((t) =>
            t.t_nombre?.toLowerCase().includes(busqueda.toLowerCase())
          );

      return {
        proyecto,
        tareas: tareasFiltradas,
        mostrar: proyectoCoincide || tareasFiltradas.length > 0,
      };
    })
    .filter(({ mostrar }) => mostrar);

  const handleModificarTarea = (tarea) => {
  // Por ejemplo, guardar la tarea en localStorage y redirigir
  localStorage.setItem("tareaModificar", JSON.stringify(tarea));
  // Si quieres navegar a otra ruta:
  navigate(`/EditarTareas/${tarea.id_tarea}`);
};

  return (
    <div className="main-layout">
        {/* ===== MENU LATERAL ===== */}
        <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <MenuDinamico 
            collapsed={sidebarCollapsed}
            departamentoId={localStorage.getItem('last_depId')} 
            departamentoNombre={localStorage.getItem('last_depNombre')} 
            departamentoSlug={localStorage.getItem('last_depSlug')} 
            activeRoute="modificar-t"
          />
        </div>
  
        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
          {/* Fondo semitransparente */}
          <div className="logo-fondo">
            <img src={logo3} alt="Fondo" />
          </div>
  
          {/* ===== BARRA SUPERIOR ===== */}
          <div className="header-global">
            <div className="header-left" onClick={toggleSidebar}>
              <FaBars className="icono-hamburguesa-global" />
            </div>
            <div className="barra-center">
              <span className="titulo-barra-global">
                TAREAS POR REVISAR 
              </span>
            </div>
          </div>

      <div className="container my-4">
        <h1 className="form-titulo text-center">Modificar Tareas</h1>

        {/* BUSCADOR */}
        <div className="buscador-tareas-contenedor">
          <div className="buscador-tareas-inner">
            <FiSearch className="buscador-tareas-icono" />
            <input
              type="text"
              placeholder="Buscar tareas o proyectos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="buscador-tareas-input"
            />
            {busqueda && (
              <button
                className="buscador-tareas-clear"
                onClick={() => setBusqueda("")}
              >
                <FiX />
              </button>
            )}
          </div>

          {busqueda && (
            <div className="buscador-tareas-resultados">
              {proyectos.filter((p) =>
                p.proyecto.p_nombre.toLowerCase().includes(busqueda.toLowerCase())
              ).length}{" "}
              resultado(s) para "{busqueda}"
            </div>
          )}
        </div>

        {/* PROYECTOS Y TAREAS */}
        {loading ? (
          <div className="loader-container">
            <div className="loader-logo">
              <img src={logo3} alt="Cargando" />
            </div>
            <div className="loader-texto">CARGANDO...</div>
            <div className="loader-spinner"></div>
          </div>
        ) : proyectosFiltrados.length === 0 ? (
          <p className="loading-tareas text-center">
            No hay proyectos o tareas que coincidan con la búsqueda.
          </p>
        ) : (
          proyectosFiltrados.map(({ proyecto, tareas }) => (
            <div key={proyecto.id_proyecto} className="proyecto-card">
              <h3 className="proyecto-nombre">{proyecto.p_nombre}</h3>

              {tareas.length > 0 ? (
                <ul className="tareas-lista">
                  {tareas.map((tarea) => (
  <li key={tarea.id_tarea} className="tarea-item-en-proceso">
  <div className="tarea-info">
    <div className="tarea-header">
      <FaClock className="tarea-icono-estado en-proceso" />
      <label className="tarea-nombre">{tarea.t_nombre}</label>
    </div>
    <div className="tarea-footer">
      <span className="tarea-estatus-en-proceso">{tarea.t_estatus}</span>
      <span className="tarea-fecha">
        Vence: {tarea.tf_fin || tarea.fechaVencimiento}
      </span>
      <button
        className="btn-modificar-tarea"
        onClick={() => handleModificarTarea(tarea)}
      >
        Modificar
      </button>
    </div>
  </div>
</li>

))}

                </ul>
              ) : (
                <p className="tarea-no-mensaje">
                  No hay tareas pendientes en este proyecto.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}

export default ModificarTareas;




