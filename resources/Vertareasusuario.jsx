import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Header from "./Header";
import "../css/proyectos.css"; // reutilizamos los estilos de proyectos

function Vertareas() {
  const [tareas, setTareas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tareasAEliminar, setTareasAEliminar] = useState([]);
  const navigate = useNavigate();
  const { accion } = useParams(); // "ver", "modificar" o "eliminar"

  // Mapa de acciones con texto del botón
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

  useEffect(() => {
    const idProyecto = localStorage.getItem("id_proyecto");
    if (!idProyecto) return;

    fetch(`http://127.0.0.1:8000/api/proyectos/${idProyecto}/tareas`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos del fetch:", data); // <-- imprime todo
        const tareasConSeleccion = (data.tareas || []).map((t) => ({
          ...t,
          selected: false,
          proyectoNombre: data.proyecto?.p_nombre || "Proyecto desconocido",
          id: t.id_tarea,
        }));
        setTareas(tareasConSeleccion);
      })
      .catch((err) => console.error("Error al cargar tareas:", err));
  }, []);

  const toggleSeleccion = (idTarea) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === idTarea ? { ...t, selected: !t.selected } : t
      )
    );
  };

  const abrirModalEliminar = () => {
    const seleccionadas = tareas.filter((t) => t.selected);
    if (seleccionadas.length === 0) return;
    setTareasAEliminar(seleccionadas);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    try {
      const ids = tareasAEliminar.map((t) => t.id);
      const response = await fetch("http://127.0.0.1:8000/api/tareas/eliminar-multiples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await response.json();

      if (data.success) {
        setTareas((prev) => prev.filter((t) => !t.selected));
        alert(data.mensaje || "Tareas eliminadas correctamente");
      } else {
        alert(data.mensaje || "Ocurrió un error al eliminar las tareas");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error: " + error.message);
    } finally {
      setShowModal(false);
      setTareasAEliminar([]);
    }
  };

  const handleAccion = async (tarea) => {
  switch (accion) {
    case "ver":
      navigate("/verTarea", { state: tarea });
      break;

    case "modificar":
      try {
        // Traer usuario completo desde tu API
        const res = await fetch(`http://127.0.0.1:8000/api/usuarios/${tarea.id_usuario}`);
        const usuario = await res.json();

        // Crear objeto completo que incluye usuario y departamento
        const tareaParaEditar = {
          ...tarea,
          usuario, // usuario ya debe traer id_departamento
        };

        console.log("Tarea enviada con usuario completo:", tareaParaEditar);
        navigate("/editarTareas", { state: tareaParaEditar });

      } catch (error) {
        console.error("Error al traer usuario:", error);
        alert("No se pudo cargar la información del usuario.");
      }
      break;

    case "eliminar":
      toggleSeleccion(tarea.id);
      break;

    default:
      break;
  }
};


  const seleccionadasCount = tareas.filter((t) => t.selected).length;

  return (
    <div className="container-fluid p-0 app-global">
      <Header />

      {titulo && <p className="proyectos-titulo-eliminar">{titulo}</p>}

      <div className="proyectos-lista-proyectos">
        {tareas.length > 0 ? (
          tareas.map((t) => (
            <div
              key={t.id}
              className={`proyectos-card ${t.selected && accion === "eliminar" ? "seleccionado" : ""}`}
              onClick={() => accion === "eliminar" && toggleSeleccion(t.id)}
            >
              <div className="proyecto-nombre">{t.proyectoNombre}</div>
<div className="tarea-nombre">{t.t_nombre}</div>


              <div className="proyectos-info">
                <span>Estado: {t.t_estatus}</span>
                <span>Vence: {t.tf_fin}</span>
              </div>

              {accion === "modificar" && (
  <div className="proyectos-botones">
    <button className="proyectos-btn" onClick={() => handleAccion(t)}>
      {textoBoton}
    </button>
  </div>
)}

            </div>
          ))
        ) : (
          <p className="text-center">No hay tareas disponibles</p>
        )}
      </div>

      {mostrarEliminar && seleccionadasCount > 0 && (
        <div className="acciones-globales" style={{ textAlign: "center", margin: "20px 0" }}>
          <button className="proyectos-btn btn-danger" onClick={abrirModalEliminar}>
            {seleccionadasCount === 1
              ? "Eliminar tarea seleccionada"
              : "Eliminar tareas seleccionadas"}
          </button>
        </div>
      )}

      {showModal && (
        <>
          <div className="modal-backdrop-custom" onClick={() => setShowModal(false)} />
          <div className="modal-container-custom">
            <div className="modal-content-custom">
              <button className="btn-close-custom" onClick={() => setShowModal(false)}>
                &times;
              </button>
              <div className="modal-header-custom">
                <FaTrashAlt style={{ verticalAlign: "middle" }} />
                Confirmar Eliminación
              </div>
              <div className="modal-body-custom">
                <p>
                  {tareasAEliminar.length === 1 ? (
                    <>¿Seguro que quieres eliminar la tarea: <strong>{tareasAEliminar[0].t_nombre}</strong>?</>
                  ) : (
                    <>¿Seguro que quieres eliminar las tareas: <strong>{tareasAEliminar.map((t) => t.t_nombre).join(", ")}</strong>?</>
                  )}
                </p>
                <p style={{ color: "#861542", fontWeight: "bold" }}>Esta acción es irreversible.</p>
              </div>
              <div className="modal-footer-custom">
                <button className="btn-custom" onClick={() => setShowModal(false)}>No</button>
                <button className="btn-custom" onClick={confirmarEliminar}>Sí</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Vertareas;






