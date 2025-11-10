
import React, { useState, useEffect } from "react";
import "../css/tareasenProceso.css";
import { FiSearch, FiX } from "react-icons/fi";
import { LuClock3 } from "react-icons/lu";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo3 from "../imagenes/logo3.png";
import '../css/global.css';
import MenuDinamico from "../components/MenuDinamico";

function TareasenProceso() {
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario?.id_usuario) return;

    const obtenerProyectos = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/tareas-proyectos-jefe?usuario=${usuario.id_usuario}`);
        const data = await res.json();
        if (data.success) setProyectos(data.proyectos);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerProyectos();
  }, []);

const todasLasTareasFinalizadas = (proyecto) => {
  if (!proyecto.tareas || proyecto.tareas.length === 0) return false;

  return (proyecto.total_tareas || 0) === (proyecto.tareas_completadas || 0);
};


  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return null;
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diferencia = fin.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const totalProyectos = proyectos.length;
  const totalTareas = proyectos.reduce((total, p) => total + (p.total_tareas || 0), 0);
  const tareasCompletadas = proyectos.reduce((total, p) => total + (p.tareas_completadas || 0), 0);

  const proyectosFiltrados = proyectos.filter(p =>
    p.p_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleVerTareas = (proyecto) => {
    sessionStorage.setItem("proyectoSeleccionado", JSON.stringify(proyecto));
    navigate("/VerTareasPendientes");
  };
const handleCompletarTareaProyecto = async (idProyecto) => {
  setCargando(true);
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/proyectos/${idProyecto}/finalizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (data.success) {
      // Eliminamos el proyecto finalizado del estado local para que desaparezca de la lista
      setProyectos(prev => prev.filter(p => p.id_proyecto !== idProyecto));
    } else {
      console.error(data.mensaje);
    }
  } catch (error) {
    console.error("Error al finalizar proyecto:", error);
  } finally {
    setCargando(false);
  }
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
          activeRoute="tareas-enproceso"
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
        <h1 className="form-titulo mb-3 text-center">Proyectos en Proceso</h1>

        {/* Estadísticas */}
        <div className="tareas-proceso-stats-container mb-4">
          <div className="tareas-proceso-stat-card">
            <div className="stat-number">{totalProyectos}</div>
            <div className="stat-label-tp">Número de proyectos</div>
          </div>
          <div className="tareas-proceso-stat-card">
            <div className="stat-number">{totalTareas}</div>
            <div className="stat-label-tp">Total de tareas</div>
          </div>
          <div className="tareas-proceso-stat-card">
            <div className="stat-number">{tareasCompletadas}</div>
            <div className="stat-label-tp">Tareas completadas</div>
          </div>
        </div>

        <div className="buscador-verproyectos-contenedor">
          <div className="buscador-verproyectos-inner">
            <FiSearch className="buscador-verproyectos-icono" />
            <input
              type="text"
              placeholder="Buscar proyectos por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="buscador-verproyectos-input"
            />
            {busqueda && (
              <button className="tareas-proceso-buscador-clear" onClick={() => setBusqueda("")}>
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="tareas-proceso-lista">
           {loading ? (
          <div className="loader-container">
            <div className="loader-logo">
              <img src={logo3} alt="Cargando" />
            </div>
            <div className="loader-texto">CARGANDO...</div>
            <div className="loader-spinner"></div>
          </div>
          ) : proyectosFiltrados.length > 0 ? (
            proyectosFiltrados.map(p => {
              const porcentajeCompletado = Math.round(((p.tareas_completadas || 0) / (p.total_tareas || 1)) * 100);
              const diasRestantes = calcularDiasRestantes(p.pf_fin);
              // ELIMINAMOS el cálculo erróneo del frontend: const tareasPendientes = p.total_tareas - (p.tareas_completadas || 0); 
              
              return (
                <div key={p.id_proyecto} className="tareas-proceso-card">
                  {/* Header con estado y acciones */}
                  <div className="tareas-proceso-card-header">
                    <div className="tareas-proceso-estado-container">
                      <LuClock3 className="tareas-proceso-icono-estado en-proceso" />
                      <span className={`tareas-proceso-estatus-badge ${p.p_estatus?.toLowerCase().replace(' ', '-')}`}>
                        {p.p_estatus}
                      </span>
                    </div>
                  </div>

                  {/* Nombre del proyecto */}
                  <div className="tareas-proceso-proyecto-nombre">{p.p_nombre}</div>
                  
                  {/* Información del proyecto */}
                  <div className="tareas-proceso-meta-info">
                    <div className="tareas-proceso-meta-item">
                      <span className="meta-label">Fecha límite</span>
                      <span className="meta-value">{formatearFecha(p.pf_fin)}</span>
                      {diasRestantes <= 3 && diasRestantes >= 0 && (
                        <span className="dias-restantes urgente">{diasRestantes} días</span>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso mejorada */}
                  <div className="tareas-proceso-progress-container">
                    <div className="tareas-proceso-progress-header">
                      <span>Progreso del proyecto</span>
                      <span className="porcentaje">{porcentajeCompletado}%</span>
                    </div>
                    <div className="tareas-proceso-progress-bar">
                      <div 
                        className="tareas-proceso-progress-fill" 
                        style={{ width: `${porcentajeCompletado}%` }}
                      ></div>
                    </div>
                    <div className="tareas-proceso-progress-stats">
                      <span>{p.tareas_completadas || 0} completadas</span>
                      <span>{p.total_tareas - (p.tareas_completadas || 0)} pendientes</span> {/* Se mantiene la diferencia para la etiqueta de la barra, aunque no es el foco */}
                    </div>
                  </div>

                  {/* Información de tareas */}
                  <div className="tareas-proceso-tareas-info">
                    <div className="tarea-stats">
                      <div className="stat">
                        <span className="stat-number">{p.total_tareas || 0}</span>
                        <span className="stat-label">Total de tareas</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{p.tareas_completadas || 0}</span>
                        <span className="stat-label">Tareas Completadas</span>
                      </div>
                      <div className="stat">
                        {/* CAMBIO CLAVE: Usamos la propiedad del backend */}
                        <span className="stat-number">{p.tareas_a_revisar || 0}</span>
                        <span className="stat-label">Tareas pendientes por revisar</span>
                      </div>
                    </div>
                  </div>

                  <div className="tareas-proceso-acciones">
                    <button className="tareas-proceso-btn-ver" onClick={() => handleVerTareas(p)}>
                      <LuClock3 className="btn-icon" />
                      Ver Tareas Pendientes
                    </button>

                    {/* Checkbox SOLO si todas las tareas están finalizadas */}
                    {p.p_estatus !== "Finalizada" && todasLasTareasFinalizadas(p) && (
                      <label className="vtp-checkbox-completar">
                        <input
                          type="checkbox"
                          onChange={() => handleCompletarTareaProyecto(p.id_proyecto)}
                          disabled={cargando}
                        />
                        Marcar Proyecto como Finalizado
                      </label>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="tareas-proceso-empty-state">
              <LuClock3 className="tareas-proceso-empty-icon" />
              <h3 className="tareas-proceso-empty-title">No hay proyectos en proceso</h3>
              <p className="tareas-proceso-empty-message">
                {busqueda ? 'No se encontraron proyectos con ese nombre' : 'Todos los proyectos están completados o no hay proyectos asignados'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
</div>
  );
}

export default TareasenProceso;







