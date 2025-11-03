import React, { useState, useEffect } from "react";
import { FaEye, FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion"; // Asegúrate de tener este componente

export const TareasList = ({ filtroEstatus }) => {
  const [proyectos, setProyectos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [proyectoActual, setProyectoActual] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario?.id_usuario) return;

    const obtenerProyectos = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/proyectos/usuario", {
          params: { usuario: usuario.id_usuario },
        });
        if (res.data.success) setProyectos(res.data.proyectos);
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      }
    };

    obtenerProyectos();
  }, []);

  const handleMarcarCompletado = (proyecto) => {
    setProyectoActual(proyecto);
    setModalConfirmacion(true);
  };

  const handleConfirmarCompletar = async () => {
    if (!proyectoActual) return;
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/proyectos/${proyectoActual.id_proyecto}`,
        { p_estatus: "Completado" }
      );
      setProyectos((prev) =>
        prev.map((p) =>
          p.id_proyecto === proyectoActual.id_proyecto
            ? { ...p, p_estatus: "Completado" }
            : p
        )
      );
      alert(`Proyecto "${proyectoActual.p_nombre}" marcado como completado.`);
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      alert("Ocurrió un error al marcar el proyecto como completado.");
    } finally {
      setModalConfirmacion(false);
      setProyectoActual(null);
    }
  };

  const handleCancelarCompletar = () => {
    setModalConfirmacion(false);
    setProyectoActual(null);
  };

  const handleVerEvidencias = async (proyecto) => {
    setProyectoActual(proyecto);
    setModalVisible(true);
    setIndiceActual(0);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/proyectos/${proyecto.id_proyecto}/evidencias`
      );
      const evidenciasArray = Array.isArray(res.data)
        ? res.data
        : res.data.evidencias || [];
      setEvidencias(
        evidenciasArray.filter((ev) =>
          ev.ruta_archivo.match(/\.(jpg|jpeg|png|gif)$/i)
        )
      );
    } catch (error) {
      console.error("Error al cargar evidencias:", error);
      setEvidencias([]);
    }
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setEvidencias([]);
    setProyectoActual(null);
  };

  const handlePrev = () => {
    setIndiceActual((prev) => (prev === 0 ? evidencias.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndiceActual((prev) => (prev === evidencias.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="proyectos-lista-proyectos">
        {proyectos.length > 0 ? (
          proyectos.map((p) => (
            <div key={p.id_proyecto} className="proyectos-card">
              <div className="proyecto-nombre">{p.p_nombre}</div>
              <div className="proyectos-info">
                <label>Estado: {p.p_estatus}</label>
                <label>Vence: {p.pf_fin}</label>
              </div>
             {filtroEstatus?.toLowerCase() === "en proceso" && (
  <div className="acciones-proyecto">
    <input
      type="checkbox"
      title="Marcar como completada"
      onChange={() => handleMarcarCompletado(p)}
    />
    <button
      className="btn-ver-tarea"
      onClick={(e) => {
        e.stopPropagation();
        handleVerEvidencias(p);
      }}
    >
      <FaEye /> Ver Evidencias
    </button>
  </div>
)}
 </div>
          ))
        ) : (
          <p className="text-center">No hay proyectos disponibles</p>
        )}
      </div>

      {modalVisible && (
        <div className="vertareas-modal-preview">
          <div className="vertareas-modal-content">
            <button className="vertareas-modal-close" onClick={handleCerrarModal}>
              &times;
            </button>
            <h2 className="modal-titulo">
              Evidencias de: {proyectoActual?.p_nombre}
            </h2>
            {evidencias.length > 0 ? (
              <>
                <div className="modal-imagen-contenedor">
                  <img
                    src={`http://127.0.0.1:8000/storage/${evidencias[indiceActual].ruta_archivo}`}
                    alt={evidencias[indiceActual].ruta_archivo.split("/").pop()}
                  />
                  {evidencias.length > 1 && (
                    <>
                      <button className="modal-carrusel-btn" onClick={handlePrev}>
                        &#10094;
                      </button>
                      <button className="modal-carrusel-btn" onClick={handleNext}>
                        &#10095;
                      </button>
                    </>
                  )}
                </div>
                <p className="modal-indicador">
                  {indiceActual + 1} / {evidencias.length}
                </p>
              </>
            ) : (
              <p className="modal-no-imagenes">Cargando...</p>
            )}
          </div>
        </div>
      )}

      <ModalConfirmacion
        mostrar={modalConfirmacion}
        onCerrar={handleCancelarCompletar}
        onConfirmar={handleConfirmarCompletar}
        titulo="Confirmar acción"
        mensaje={`¿Seguro que quieres marcar el proyecto "${proyectoActual?.p_nombre}" como completado?`}
        icono={<FaCheckCircle />}
      />
    </>
  );
};








