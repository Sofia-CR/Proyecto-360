import React, { useState, useEffect } from "react";
import '../css/global.css';
import "../css/TareasCJ.css"; 
import logo3 from "../imagenes/logo3.png";
import { FiX } from "react-icons/fi";
import { FaBars,FaSearch, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import MenuDinamico from "../components/MenuDinamico";


function TareasCompletadasJefe() {
  const [busqueda, setBusqueda] = useState("");
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeAPI, setMensajeAPI] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const fetchTareasCompletadas = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario?.id_usuario) {
          setMensajeAPI("Usuario no logeado");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `http://127.0.0.1:8000/api/tareasCompletadas/jefe?usuario=${usuario.id_usuario}`
        );
        const data = await res.json();

        if (data.success && data.proyectos.length > 0) {
          const tareasPlanas = data.proyectos.flatMap(p => 
  p.tareas.map(t => ({ ...t, p_nombre: p.proyecto?.p_nombre || '', t_nombre: t.nombre || '' }))
);

          setTareas(tareasPlanas);
          setMensajeAPI("");
        } else {
          setTareas([]);
          setMensajeAPI(data.mensaje || "No hay tareas completadas para este usuario");
        }
      } catch (error) {
        setMensajeAPI("Error al cargar tareas");
        setTareas([]);
        console.error("Error al cargar tareas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTareasCompletadas();
  }, []);

  // --- CAMBIO 1: Filtro más seguro ---
  // Guardamos el término de búsqueda en minúsculas una sola vez
  const terminoBusqueda = busqueda.toLowerCase();
  
  const tareasFiltradas = tareas.filter(
    (tarea) => {
      // Nos aseguramos de que los nombres sean strings antes de llamar .toLowerCase()
      // Usamos (|| '') para convertir null/undefined en un string vacío
      const nombreTarea = String(tarea.t_nombre || '').toLowerCase();
      const nombreProyecto = String(tarea.p_nombre || '').toLowerCase();
      
      return nombreTarea.includes(terminoBusqueda) || nombreProyecto.includes(terminoBusqueda);
    }
  );

  // Agrupamiento de tareas por proyecto
  const proyectosAgrupados = tareasFiltradas.reduce((proyectos, tarea) => {
    const proyectoExistente = proyectos.find((p) => p.p_nombre === tarea.p_nombre);
    if (proyectoExistente) {
      proyectoExistente.tareas.push(tarea);
    } else {
      proyectos.push({ p_nombre: tarea.p_nombre, tareas: [tarea] });
    }
    return proyectos;
  }, []);

  return (
    <div className="main-layout">
        {/* ===== MENU LATERAL ===== */}
        <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <MenuDinamico 
            collapsed={sidebarCollapsed}
            departamentoId={localStorage.getItem('last_depId')} 
            departamentoNombre={localStorage.getItem('last_depNombre')} 
            departamentoSlug={localStorage.getItem('last_depSlug')} 
            activeRoute="tareas-completadas"
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
                TAREAS COMPLETADAS 
              </span>
            </div>
          </div>

          <div className="container my-4">
            <div className="text-center">
              <h1 className="form-titulo">Tareas Completadas</h1>
            </div>
            
  <div className="barra-busqueda-global-container mb-4">
  <div className="barra-busqueda-global-wrapper">
    <FaSearch className="barra-busqueda-global-icon" />
    <input
      type="text"
      placeholder="Buscar tareas ..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="barra-busqueda-global-input"
    />
    {busqueda && (
      <button
        className="buscador-clear-global"
        onClick={() => setBusqueda("")}
      >
        <FiX />
      </button>
    )}
  </div>

  {busqueda && (
    <div className="buscador-resultados-global">
      {tareasFiltradas.length} resultado(s) para "{busqueda}"
    </div>
  )}
</div>



      
     

            <div className="tcj-proyectos-filtros">
              
              {/* --- CAMBIO 2: Lógica de renderizado corregida --- */}
              <div className="tcj-container">
                {loading ? (
                  // ESTADO 1: Cargando
                  <div className="loader-container">
                    <div className="loader-logo">
                      <img src={logo3} alt="Cargando" />
                    </div>
                    <div className="loader-texto">CARGANDO TAREAS COMPLETADAS...</div>
                    <div className="loader-spinner"></div>
                  </div>
                ) : tareas.length === 0 ? (
                  // ESTADO 2: Carga finalizada, pero no hay tareas en absoluto
                  <div className="tcj-no-tasks">
                    <FaInfoCircle size={50} />
                    <span>{mensajeAPI || "No hay tareas completadas."}</span>
                  </div>
                )  : (
                  // ESTADO 4: Hay tareas Y hay resultados de búsqueda
                  proyectosAgrupados.map(({ p_nombre, tareas: tareasDelProyecto }) => (
                    <div key={p_nombre} className="tcj-card">
                      <h3 className="tcj-proj-name">{p_nombre}</h3>
                      <ul className="tcj-task-list">
                        {tareasDelProyecto.map((tarea) => (
                          <li key={tarea.id_tarea} className="tcj-task-item">
                            <div className="tcj-task-info">
                              <div className="tcj-task-header">
                                <FaCheckCircle className="tcj-icon" />
                                <label className="tcj-task-name">Tarea: {tarea.t_nombre}</label>
                              </div>
                              <div className="tcj-task-footer">
                                <span className="tcj-task-status">{tarea.t_estatus}</span>
                                <span className="tcj-task-date">
                                  Vence: {tarea.tf_fin || tarea.fechaVencimiento}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
  </div>
  );
}

export default TareasCompletadasJefe;






