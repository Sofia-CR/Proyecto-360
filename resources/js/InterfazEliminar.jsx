import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import Header from "./Header";
import "../css/proyectos.css"; // Usamos CSS de Proyectos

function InterfazEliminar() {
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = () => {
    setLoading(true);
    axios
      .get("/api/tareas/pendientes")
      .then((res) => setTareas(res.data.tareas || []))
      .catch((error) => console.error("Error cargando tareas:", error))
      .finally(() => setLoading(false));
  };

  const seleccionarTarea = (tarea) => {
    setTareaSeleccionada(tarea);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    if (!tareaSeleccionada) return;

    try {
      await axios.delete(`/api/tareas/${tareaSeleccionada.id}`);
      alert("Tarea eliminada correctamente");
      cargarTareas();
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      alert("Ocurrió un error al eliminar la tarea");
    } finally {
      setShowModal(false);
      setTareaSeleccionada(null);
    }
  };

  const tareasFiltradas = tareas.filter((t) =>
    t.t_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="proyectos-app">
      <Header />

      <h1 className="proyectos-titulo-eliminar text-center my-4">
        Eliminar Tareas
      </h1>

      {/* Buscador */}
      <div className="proyectos-buscador mb-3">
        <input
          type="text"
          placeholder="Buscar tarea..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="proyectos-input-buscar"
        />
      </div>

      {/* Lista de tareas */}
      {loading ? (
        <p className="text-center">Cargando tareas...</p>
      ) : tareasFiltradas.length === 0 ? (
        <p className="text-center">No hay tareas pendientes.</p>
      ) : (
        <div className="proyectos-lista-proyectos">
          {tareasFiltradas.map((t) => (
            <div
              key={t.id}
              className={`proyectos-card ${
                tareaSeleccionada?.id === t.id 
              }`}
              onClick={() => seleccionarTarea(t)}
            >
              <h5 className="proyecto-nombre">{t.t_nombre}</h5>
              <div className="proyectos-info">
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && tareaSeleccionada && (
        <>
          <div
            className="modal-backdrop-custom"
            onClick={() => setShowModal(false)}
          />
          <div className="modal-container-custom">
            <div className="modal-content-custom">
              <button
                className="btn-close-custom"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <div className="modal-header-custom">
                <FaTrashAlt /> Confirmar Eliminación
              </div>
              <div className="modal-body-custom">
                <p>
                  ¿Seguro que quieres eliminar la tarea:{" "}
                  <strong>{tareaSeleccionada.t_nombre}</strong>?
                </p>
                <p style={{ color: "#861542", fontWeight: "bold" }}>
                  Esta acción es irreversible.
                </p>
              </div>
              <div className="modal-footer-custom">
                <button
                  className="btn-custom"
                  onClick={() => setShowModal(false)}
                >
                  No
                </button>
                <button className="btn-custom" onClick={confirmarEliminar}>
                  Sí
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InterfazEliminar;




