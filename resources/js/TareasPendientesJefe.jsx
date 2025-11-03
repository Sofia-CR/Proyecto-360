import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../css/TareasPendientes.css";
import logo3 from "../imagenes/logo3.png";
import { FaExclamationCircle } from "react-icons/fa";

function TareasPendientesJefe() {
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTareasPendientes = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario?.id_usuario) return;

        const res = await fetch(
          `http://127.0.0.1:8000/api/tareasPendientes/jefe/${usuario.id_usuario}`
        );
        const data = await res.json();

        if (data.success) {
          setProyectos(data.tareas); // Guardamos la respuesta directamente
        } else {
          console.error("Error al cargar proyectos y tareas:", data.mensaje);
        }
      } catch (error) {
        console.error("Error al cargar proyectos y tareas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTareasPendientes();
  }, []);

  const proyectosFiltrados = proyectos
    .map(({ p_nombre, tareas }) => {
      const proyectoCoincide = p_nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      const tareasFiltradas = proyectoCoincide
        ? tareas
        : tareas.filter((t) =>
            t.t_nombre?.toLowerCase().includes(busqueda.toLowerCase())
          );

      return {
        p_nombre,
        tareas: tareasFiltradas,
        mostrar: proyectoCoincide || tareasFiltradas.length > 0,
      };
    })
    .filter(({ mostrar }) => mostrar);

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <div className="container my-4">
        <div className="text-center">
          <h1 className="form-titulo">Tareas Pendientes</h1>
        </div>
        <div className="proyectos-filtros">
          <div className="contenedor-buscador-y-tarjetas">
            <div className="proyectos-buscador">
              <input
                type="text"
                placeholder="Buscar tareas o proyectos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="proyectos-input-buscar"
              />
            </div>
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
              proyectosFiltrados.map(({ p_nombre, tareas }, index) => (
                <div key={index} className="proyectos-card">
                  <h3 className="nombre-proyecto">{p_nombre}</h3>
                  {tareas.length > 0 ? (
                    <ul className="lista-tareas-TP">
                      {tareas.map((tarea) => (
                        <li key={tarea.id_tarea} className="item-tarea-pendiente">
                          <div className="info-tarea-TP">
                            <div className="tarea-header">
                              <FaExclamationCircle className="icono-pendiente" />
                              <label className="tarea-nombre-TP">
                                {tarea.t_nombre}
                              </label>
                            </div>
                            <div className="tarea-footer">
                              <span className="tarea-estatus-Pendiente">
                                {tarea.t_estatus}
                              </span>
                              <span className="tarea-fecha-TP">
                                Vence: {tarea.tf_fin}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-tareas">No hay tareas pendientes en este proyecto.</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TareasPendientesJefe;

