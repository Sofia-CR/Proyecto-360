import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Header from "./Header";
import logo3 from "../imagenes/logo3.png";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/proyectos.css";

function Proyectos() {
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [proyectosAEliminar, setProyectosAEliminar] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const accion = location.pathname.split("/")[2] || "ver";
  const accionMap = {
    ver: { textoBoton: "Ver tareas", mostrarEliminar: false },
    agregar: { textoBoton: "Agregar tarea", mostrarEliminar: false },
    modificar: { textoBoton: "Modificar", mostrarEliminar: false },
    eliminar: { textoBoton: null, mostrarEliminar: true },
  };

  const { textoBoton, mostrarEliminar } = accionMap[accion] || accionMap.ver;
  const titulo =
    accion === "eliminar"
      ? "Eliminar Proyectos"
      : accion === "ver"
      ? "Proyectos"
      : accion === "modificar"
      ? "Modificar proyectos"
      : null;

  useEffect(() => {
    const cargarProyectos = async () => {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const token = localStorage.getItem("jwt_token");
      const idUsuario = usuario?.id_usuario;

      if (!idUsuario) return alert("Usuario no encontrado.");
      if (!token) return alert("No hay token de autenticación, inicia sesión.");

      try {
        setLoading(true);
        const res = await fetch(
          `http://127.0.0.1:8000/api/proyectos/usuario?usuario=${idUsuario}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json().catch(async () => ({ error: await res.text() }));

        if (res.ok && data.success && Array.isArray(data.proyectos)) {
          const proyectosConSeleccion = data.proyectos.map((p) => ({
            ...p,
            selected: false,
            tareas_count: p.total_tareas,
          }));
          setProyectos(proyectosConSeleccion);
        } else {
          console.error("Respuesta inesperada de la API:", data);
          setProyectos([]);
        }
      } catch (err) {
        console.error("Error al cargar proyectos:", err);
        alert("Ocurrió un error al cargar los proyectos.");
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, []);

  const toggleSeleccion = (idProyecto) => {
    setProyectos((prev) =>
      prev.map((p) =>
        p.id_proyecto === idProyecto ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const abrirModalEliminar = () => {
    const seleccionados = proyectos.filter((p) => p.selected);
    if (seleccionados.length === 0) return;
    setProyectosAEliminar(seleccionados);
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return alert("No hay token de autenticación, inicia sesión.");

    try {
      const ids = proyectosAEliminar.map((p) => p.id_proyecto);
      const response = await fetch(
        "http://127.0.0.1:8000/api/proyectos/eliminar-multiples",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        }
      );

      const data = await response.json().catch(async () => ({ error: await response.text() }));

      if (response.ok && data.success) {
        setProyectos((prev) => prev.filter((p) => !p.selected));
        alert(data.mensaje || "Proyectos eliminados correctamente");
      } else {
        alert(data.mensaje || "Ocurrió un error al eliminar los proyectos");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al eliminar los proyectos: " + error.message);
    } finally {
      setShowModal(false);
      setProyectosAEliminar([]);
    }
  };

  const handleAccion = (idProyecto) => {
    switch (accion) {
      case "ver":
        localStorage.setItem("id_proyecto", idProyecto);
        navigate("/vertareasusuario");
        break;
      case "agregar":
        navigate("/agregarTareas", { state: { id_proyecto: idProyecto } });
        break;
      case "modificar":
        localStorage.setItem("id_proyecto", idProyecto);
        navigate("/modificarProyecto", { state: { idProyecto } });
        break;
      case "eliminar":
        toggleSeleccion(idProyecto);
        break;
      default:
        break;
    }
  };

  const proyectosFiltrados = proyectos.filter((p) =>
    p.p_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionadosCount = proyectos.filter((p) => p.selected).length;

  const mostrarSelect = busqueda.length === 0 || proyectosFiltrados.length > 0;

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      {titulo && <p className="form-titulo">{titulo}</p>}

      <div className="proyectos-buscador">
        <input
          type="text"
          placeholder="Buscar proyecto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="proyectos-input-buscar"
        />
      </div>

      {mostrarSelect && <div className="custom-select-container-inline"></div>}

      <div className="proyectos-lista-proyectos">
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
            No hay proyectos que coincidan con la búsqueda.
          </p>
        ) : (
          proyectosFiltrados.map((p) => (
            <div
              key={p.id_proyecto}
              className={`proyectos-card ${
                p.selected && accion === "eliminar" ? "seleccionado" : ""
              }`}
              onClick={() =>
                accion === "eliminar" ? toggleSeleccion(p.id_proyecto) : null
              }
            >
              <h5 className="proyecto-nombre">{p.p_nombre}</h5>
              <div className="proyectos-info">
                <div>
                  <div>Tareas: {p.tareas_count}</div>
                  <div>Vence: {p.pf_fin}</div>
                </div>
              </div>
              {accion !== "eliminar" && (
                <div className="proyectos-botones">
                  <button
                    className="proyectos-btn"
                    onClick={() => handleAccion(p.id_proyecto)}
                  >
                    {textoBoton}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {mostrarEliminar && seleccionadosCount > 0 && (
        <div className="acciones-globales text-center my-3">
          <button
            className="proyectos-btn btn-danger"
            onClick={abrirModalEliminar}
          >
            {seleccionadosCount === 1
              ? "Eliminar proyecto seleccionado"
              : "Eliminar proyectos seleccionados"}
          </button>
        </div>
      )}

      {showModal && (
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
                <FaTrashAlt style={{ verticalAlign: "middle" }} />
                Confirmar Eliminación
              </div>
              <div className="modal-body-custom">
                <p>
                  {proyectosAEliminar.length === 1 ? (
                    <>
                      ¿Seguro que quieres eliminar el proyecto:{" "}
                      <strong>{proyectosAEliminar[0].p_nombre}</strong>?
                    </>
                  ) : (
                    <>
                      ¿Seguro que quieres eliminar los proyectos:{" "}
                      <strong>
                        {proyectosAEliminar.map((p) => p.p_nombre).join(", ")}
                      </strong>
                      ?
                    </>
                  )}
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

export default Proyectos;


