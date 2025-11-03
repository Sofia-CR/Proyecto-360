import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import { useTareas } from "./UsarTareas";
import { TareasList } from "./ListaTareas";
import "../css/vertareas.css"; 

function Vertareas() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tareasAEliminar, setTareasAEliminar] = useState([]);
  const [modalEvidenciasVisible, setModalEvidenciasVisible] = useState(false);
  const [tareaActual, setTareaActual] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);

  const navigate = useNavigate();
  const { accion } = useParams();
  const { tareas, toggleSeleccion } = useTareas(accion);

  const accionMap = {
    ver: { textoBoton: "Ver", mostrarEliminar: false },
    modificar: { textoBoton: "Modificar", mostrarEliminar: false },
    eliminar: { textoBoton: null, mostrarEliminar: true },
  };

  const { textoBoton, mostrarEliminar } = accionMap[accion] || accionMap.ver;

  const titulo =
    accion === "eliminar"
      ? "Eliminar Tareas"
      : accion === "ver" || accion === "modificar"
      ? "Tareas del Proyecto"
      : null;

  const handleAccion = (tarea) => {
    switch (accion) {
      case "ver":
        navigate("/verTarea", { state: tarea });
        break;
      case "modificar":
        navigate("/editarTareas", { state: { ...tarea } });
        break;
      case "eliminar":
        toggleSeleccion(tarea.id);
        break;
      default:
        break;
    }
  };

  const abrirModalEliminar = () => {
    const seleccionadas = tareas.filter(t => t.selected);
    if (!seleccionadas.length) return;
    setTareasAEliminar(seleccionadas);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      const ids = tareasAEliminar.map(t => t.id);
      const res = await fetch("http://127.0.0.1:8000/api/tareas/eliminar-multiples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) setTareas(prev => prev.filter(t => !t.selected));
      alert(data.mensaje || (data.success ? "Tareas eliminadas correctamente" : "Ocurrió un error al eliminar las tareas"));
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error: " + error.message);
    } finally {
      setShowModal(false);
      setTareasAEliminar([]);
    }
  };
  const handleVerEvidencias = async (t) => {
    setTareaActual(t);
    setModalEvidenciasVisible(true);
    setIndiceActual(0);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tarea/${t.id}/evidencias`);
      const data = await res.json();
      const evidenciasArray = Array.isArray(data) ? data : data.evidencias || [];
      const imagenes = evidenciasArray.filter(ev =>
        ev.ruta_archivo.match(/\.(jpg|jpeg|png|gif)$/i)
      );
      setEvidencias(imagenes);
    } catch (err) {
      console.error("Error al cargar evidencias:", err);
      setEvidencias([]);
    }
  };

  const handleCerrarModalEvidencias = () => {
    setModalEvidenciasVisible(false);
    setTareaActual(null);
    setEvidencias([]);
    setIndiceActual(0);
  };

  const handlePrev = () => setIndiceActual(prev => (prev === 0 ? evidencias.length - 1 : prev - 1));
  const handleNext = () => setIndiceActual(prev => (prev === evidencias.length - 1 ? 0 : prev + 1));

  // --- Filtrado de tareas ---
  const tareasFiltradas = tareas
    .filter(t => !busqueda || t.t_nombre.toLowerCase().includes(busqueda.toLowerCase()) || t.proyectoNombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(t => !filtroEstatus || t.t_estatus.toLowerCase() === filtroEstatus.toLowerCase());

  const seleccionadasCount = tareas.filter(t => t.selected).length;

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      {titulo && <p className="proyectos-titulo-eliminar">{titulo}</p>}

      <div className="proyectos-filtros">
        <div className="proyectos-buscador">
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="proyectos-input-buscar"
          />
        </div>
      </div>

      <TareasList
        tareas={tareasFiltradas}
        filtroEstatus={filtroEstatus}
        accion={accion}
        handleAccion={handleAccion}
        toggleSeleccion={toggleSeleccion}
        handleVerEvidencias={handleVerEvidencias} // <-- Pasamos la función al listado
      />

    </div>
  );
}

export default Vertareas;











