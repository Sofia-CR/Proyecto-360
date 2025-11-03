import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../css/TareasCJ.css"; 
import logo3 from "../imagenes/logo3.png";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { FiSearch, FiX } from "react-icons/fi";

function TareasCompletadasJefe() {
  const [busqueda, setBusqueda] = useState("");
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeAPI, setMensajeAPI] = useState("");

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
            p.tareas.map(t => ({ ...t, p_nombre: p.proyecto.p_nombre }))
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

  // Filtrado de tareas por búsqueda
  const tareasFiltradas = tareas.filter(
    (tarea) =>
      tarea.t_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      tarea.p_nombre.toLowerCase().includes(busqueda.toLowerCase())
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
    <div className="container-fluid p-0 app-global">
      <Header />

      <div className="container my-4">
        <div className="text-center">
          <h1 className="form-titulo">Tareas Completadas</h1>
        </div>

        <div className="proyectos-filtros">
          <div className="tcj-container">
            {/* Buscador */}
            <div className="tcj-search-container">
              <div className="tcj-search-inner">
                <FiSearch className="tcj-search-icon" />
                <input
                  type="text"
                  placeholder="Buscar tareas o proyectos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="tcj-search-input"
                />
                {busqueda && (
                  <button
                    className="tcj-search-clear"
                    onClick={() => setBusqueda("")}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            {/* Resultados de búsqueda */}
            {busqueda && (
              <div className="tcj-buscador-resultados-info">
                {proyectosAgrupados.length} resultado(s) para "{busqueda}"
              </div>
            )}

            {/* Contenido */}
            {loading ? (
              <div className="loader-container">
                <div className="loader-logo">
                  <img src={logo3} alt="Cargando" />
                </div>
                <div className="loader-texto">CARGANDO...</div>
                <div className="loader-spinner"></div>
              </div>
            ) : proyectosAgrupados.length === 0 ? (
              <div className="tcj-no-tasks">
                <FaInfoCircle size={50} />
                <span>{mensajeAPI || "No hay tareas completadas."}</span>
              </div>
            ) : (
              proyectosAgrupados.map(({ p_nombre, tareas }) => (
                <div key={p_nombre} className="tcj-card">
                  <h3 className="tcj-proj-name">{p_nombre}</h3>
                  <ul className="tcj-task-list">
                    {tareas.map((tarea) => (
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
  );
}

export default TareasCompletadasJefe;



