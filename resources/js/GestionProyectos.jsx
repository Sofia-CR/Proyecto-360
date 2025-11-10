import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaCheckCircle,
  FaHourglassHalf,
  FaTasks,
  FaExclamationTriangle,
  FaSearch,
  FaProjectDiagram
} from "react-icons/fa";
import "../css/formulario.css";
import "../css/Gestionproyectosusuario.css";
import MenuDinamico from "../components/MenuDinamico";
import logo3 from "../imagenes/logo3.png";

function GestionProyectos() {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [tareasCompletadas, setTareasCompletadas] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [tareasEnProceso, setTareasEnProceso] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario?.id_usuario) return;

    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/api/dashboard-departamento?usuario=${usuario.id_usuario}`);
        const data = await res.json();

        if (data) {
          const completadas = data.tareas.filter(t => t.t_estatus.toLowerCase() === 'finalizada');
          const pendientes = data.tareas.filter(t => t.t_estatus.toLowerCase() === 'pendiente');
          const enProceso = data.tareas.filter(t => t.t_estatus.toLowerCase() === 'en proceso');

          setTareasCompletadas(completadas);
          setTareasPendientes(pendientes);
          setTareasEnProceso(enProceso);

          const proyectosConMetricas = data.proyectos.map(proyecto => {
            const tareasDelProyecto = data.tareas.filter(t => t.id_proyecto === proyecto.id_proyecto);
            return {
              ...proyecto,
              tareas_completadas: tareasDelProyecto.filter(t => t.t_estatus.toLowerCase() === 'finalizada').length,
              tareas_pendientes: tareasDelProyecto.filter(t => t.t_estatus.toLowerCase() === 'pendiente').length,
              tareas_en_progreso: tareasDelProyecto.filter(t => t.t_estatus.toLowerCase() === 'en proceso').length,
              total_tareas: tareasDelProyecto.length
            };
          });

          setProyectos(proyectosConMetricas);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatos();
  }, [navigate]);

  const filteredProyectos = proyectos.filter(proyecto =>
    proyecto.p_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTareas = tareasCompletadas.length + tareasPendientes.length + tareasEnProceso.length;
  const porcentajeCompletitud = totalTareas > 0 ? Math.round((tareasCompletadas.length / totalTareas) * 100) : 0;

  const irAProyecto = (id, nombre) => {
    localStorage.setItem("id_proyecto", id);
    localStorage.setItem("nombre_proyecto", nombre);
    navigate(`/proyecto/${id}`);
  };

  return (
    <div className="main-layout">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <MenuDinamico
          collapsed={sidebarCollapsed}
          departamentoId={localStorage.getItem("last_depId")}
          departamentoNombre={localStorage.getItem("last_depNombre")}
          departamentoSlug={localStorage.getItem("last_depSlug")}
          activeRoute="gestion-proyectos"
        />
      </div>

      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-fondo">
          <img src={logo3} alt="Fondo" />
        </div>

        <div className="header-global">
          <div className="header-left" onClick={toggleSidebar}>
            <FaBars className="icono-hamburguesa-global" />
          </div>
          <div className="barra-center">
            <h2 className="titulo-barra-global">DASHBOARD DE PROYECTOS</h2>
          </div>
        </div>

        <div className="tdu-dashboard-content">
          <div className="barra-busqueda-global-container mb-4">
            <div className="barra-busqueda-global-wrapper">
              <FaSearch className="barra-busqueda-global-icon" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                className="barra-busqueda-global-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="tdu-metrics-grid">
            <div className="tdu-metric-card tdu-completed">
              <div className="tdu-metric-icon"><FaCheckCircle size={28} /></div>
              <div className="tdu-metric-content">
                <div className="tdu-metric-number">{tareasCompletadas.length}</div>
                <div className="tdu-metric-label">Tareas Completadas</div>
                <div className="tdu-metric-subtext">{porcentajeCompletitud}% del total</div>
              </div>
            </div>

            <div className="tdu-metric-card tdu-pending">
              <div className="tdu-metric-icon"><FaHourglassHalf size={28} /></div>
              <div className="tdu-metric-content">
                <div className="tdu-metric-number">{tareasPendientes.length}</div>
                <div className="tdu-metric-label">Pendientes</div>
                <div className="tdu-metric-subtext">Por iniciar</div>
              </div>
            </div>

            <div className="tdu-metric-card tdu-progress">
              <div className="tdu-metric-icon"><FaTasks size={28} /></div>
              <div className="tdu-metric-content">
                <div className="tdu-metric-number">{tareasEnProceso.length}</div>
                <div className="tdu-metric-label">En Progreso</div>
                <div className="tdu-metric-subtext">En ejecución</div>
              </div>
            </div>

            
          </div>

          <div className="tdu-recent-projects-section">
            <div className="tdu-section-header">
              <h2>Proyectos</h2>
              <div className="tdu-header-actions">
                <span className="tdu-project-count">{filteredProyectos.length} proyectos</span>
              </div>
            </div>

            {filteredProyectos.length === 0 ? (
              <div className="tdu-empty-state">
                <div className="tdu-empty-icon"><FaProjectDiagram size={40} /></div>
                <h3>No hay proyectos que coincidan</h3>
              </div>
            ) : (
              <div className="tdu-projects-grid">
                {filteredProyectos.map((proyecto) => {
                  const progreso =
                    proyecto.total_tareas > 0
                      ? Math.round((proyecto.tareas_completadas / proyecto.total_tareas) * 100)
                      : 0;
                  return (
                    <div key={proyecto.id_proyecto} className="tdu-project-card">
                      <div className="tdu-project-header">
                        <h3 className="tdu-project-title">{proyecto.p_nombre}</h3>
                        <div className="tdu-project-badge">
                          <span className="tdu-total-tasks">{proyecto.total_tareas} tareas</span>
                        </div>
                      </div>

                      <div className="tdu-project-progress">
                        <div className="tdu-progress-info">
                          <span>Progreso general</span>
                          <span>{progreso}%</span>
                        </div>
                        <div className="tdu-progress-bar">
                          <div className="tdu-progress-fill" style={{ width: `${progreso}%` }}></div>
                        </div>
                      </div>

                      <div className="tdu-project-tasks-summary">
                        <div className="tdu-task-indicator tdu-completed">
                          <span className="tdu-task-count">{proyecto.tareas_completadas}</span>
                          <span className="tdu-task-label">Completadas</span>
                        </div>
                        <div className="tdu-task-indicator tdu-pending">
                          <span className="tdu-task-count">{proyecto.tareas_pendientes}</span>
                          <span className="tdu-task-label">Pendientes</span>
                        </div>
                        <div className="tdu-task-indicator tdu-progress">
                          <span className="tdu-task-count">{proyecto.tareas_en_progreso}</span>
                          <span className="tdu-task-label">En Progreso</span>
                        </div>
                      </div>

                      <div className="tdu-project-footer">
                        <button
                          className="tdu-btn-primary"
                          onClick={() => irAProyecto(proyecto.id_proyecto, proyecto.p_nombre)}
                        >
                          <FaTasks className="tdu-btn-icon" />
                          Ver Proyecto
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionProyectos;



