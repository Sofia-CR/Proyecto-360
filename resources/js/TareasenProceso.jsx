import Header from "./Header";
import React, { useState, useEffect } from "react";
import "../css/tareasenProceso.css";
import { FiSearch, FiX } from "react-icons/fi";
import { LuClock3 } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import logo3 from "../imagenes/logo3.png";

function TareasenProceso() {
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const totalProyectos = proyectos.length;
  const totalTareas = proyectos.reduce((total, p) => total + (p.total_tareas || 0), 0);
  const tareasCompletadas = proyectos.reduce((total, p) => total + (p.tareas_completadas || 0), 0);

  const proyectosFiltrados = proyectos.filter(p =>
    p.p_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleVerTareas = (proyecto) => {
    // Guardar proyecto en sessionStorage
    sessionStorage.setItem("proyectoSeleccionado", JSON.stringify(proyecto));
    navigate("/VerTareasPendientes");
  };

  return (
    <div className="container-fluid p-0 tareas-proceso-global">
      <Header />
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

        {/* Buscador */}
        <div className="tareas-proceso-buscador-container flex mb-3">
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
              <button className="tareas-proceso-clear-busqueda-inline" onClick={() => setBusqueda("")}>
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="tareas-proceso-lista">
          {loading ? (
            <div className="loader-container">
              <div className="loader-logo"><img src={logo3} alt="Cargando" /></div>
              <div className="loader-texto">CARGANDO...</div>
            </div>
          ) : proyectosFiltrados.length > 0 ? (
            proyectosFiltrados.map(p => {
              const porcentajeCompletado = Math.round(((p.tareas_completadas || 0) / (p.total_tareas || 1)) * 100);
              return (
                <div key={p.id_proyecto} className="tareas-proceso-card">
                  <div className="tareas-proceso-card-header">
                    <div className="tareas-proceso-tarea-header">
                      <LuClock3 className="tareas-proceso-icono-estado en-proceso" />
                      <div className="tareas-proceso-proyecto-nombre">{p.p_nombre}</div>
                    </div>
                  </div>

                  <div className="tareas-proceso-info-tarea">
                    <span className={`tareas-proceso-estatus-badge ${p.p_estatus?.toLowerCase().replace(' ', '-')}`}>
                      {p.p_estatus}
                    </span>
                    <div className="tareas-proceso-fecha-item">Vence: {p.pf_fin}</div>
                    <div className="tareas-proceso-progress-bar">
                      <div className="tareas-proceso-progress-fill" style={{ width: `${porcentajeCompletado}%` }}></div>
                    </div>
                    <div className="tareas-proceso-progress-info">
                      <span>{p.tareas_completadas || 0} de {p.total_tareas || 0}</span>
                      <span>{porcentajeCompletado}%</span>
                    </div>
                    <button className="tareas-proceso-btn-ver" onClick={() => handleVerTareas(p)}>
                      Ver Tareas
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No hay proyectos en proceso</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TareasenProceso;








