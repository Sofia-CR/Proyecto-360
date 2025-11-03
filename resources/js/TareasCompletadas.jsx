import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../css/TareasPendientes.css";
import logo3 from "../imagenes/logo3.png";
import { FaCheckCircle } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";

function TareasCompletadas() {
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensajeAPI, setMensajeAPI] = useState("");

  useEffect(() => {
    const fetchTareasCompletadas = async () => {
      try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario?.id_usuario) return;

        const res = await fetch(
          `http://127.0.0.1:8000/api/tareasCompletadasusuario?usuario=${usuario.id_usuario}`
        );
        const data = await res.json();

        if (data.success) {
          setProyectos(data.proyectos);
          setMensajeAPI(""); // Limpia mensaje si hay proyectos
        } else {
          setProyectos([]); // Vacía proyectos
          setMensajeAPI(data.mensaje || "No hay tareas completadas");
          console.error("Error al cargar proyectos y tareas:", data.mensaje);
        }
      } catch (error) {
        setMensajeAPI("Error al cargar proyectos y tareas");
        console.error("Error al cargar proyectos y tareas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTareasCompletadas();
  }, []);

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

  return (
    <div className="container-fluid p-0 app-global">
      <Header />

      <div className="container my-4">
        <div className="text-center">
          <h1 className="form-titulo">Tareas Completadas</h1>
        </div>
        <div className="proyectos-filtros">
          <div className="contenedor-buscador-y-tarjetas">
            {loading ? (
  <div className="loader-container">
    <div className="loader-logo">
      <img src={logo3} alt="Cargando" />
    </div>
    <div className="loader-texto">CARGANDO...</div>
    <div className="loader-spinner"></div>
  </div>
) : proyectosFiltrados.length === 0 ? (
  <div 
    className="no-tareas-mensaje"
  >
    <FaInfoCircle size={50} />
    <span style={{ fontSize: "18px", fontWeight: 500 }}>
      {mensajeAPI || "No hay tareas completadas. Vuelve mas tarde"}
    </span>
  </div>
) : (
  <>
    <div className="proyectos-buscador">
      <input
        type="text"
        placeholder="Buscar tareas o proyectos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="proyectos-input-buscar"
      />
    </div>

    {proyectosFiltrados.map(({ proyecto, tareas }) => (
      <div key={proyecto.id_proyecto} className="proyectos-card">
        <h3 className="nombre-proyecto">{proyecto.p_nombre}</h3>
        {tareas.length > 0 && (
          <ul className="lista-tareas-TP">
            {tareas.map((tarea) => (
              <li key={tarea.id_tarea} className="item-tarea-finalizado">
                <div className="info-tarea-TP">
                  <div className="tarea-header">
                    <FaCheckCircle className="icono-finalizado" />
                    <label className="tarea-nombre-TP">
                      Tarea: {tarea.t_nombre}
                    </label>
                  </div>
                  <label className="tarea-estatus-Finalizado">
                    {tarea.t_estatus}
                  </label>
                  <label className="tarea-fecha-TP">
                    Vence: {tarea.tf_fin || tarea.fechaVencimiento}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </>
)}

          </div>
        </div>
      </div>
    </div>
  );
}

export default TareasCompletadas;


