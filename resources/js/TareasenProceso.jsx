import Header from "./Header";
import React, { useState, useEffect } from "react";
import "../css/tareasenProceso.css";
import { FaEye, FaCheckCircle, FaClock } from "react-icons/fa";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";
import logo3 from "../imagenes/logo3.png";
import { FiSearch, FiX } from "react-icons/fi";
import { LuClock3 } from "react-icons/lu";

function TareasenProceso() {
  const [busqueda, setBusqueda] = useState("");
  const [proyectos, setProyectos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [proyectoActual, setProyectoActual] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario?.id_usuario) return;

    const obtenerProyectos = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/tareas-proyectos-jefe",
          { params: { usuario: usuario.id_usuario } }
        );
        
        console.log('📊 Respuesta API:', res.data);
        
        if (res.data.success) {
          setProyectos(res.data.proyectos);
          console.log('✅ Proyectos con tareas en proceso:', res.data.proyectos);
        }
      } catch (error) {
        console.error("Error al obtener proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerProyectos();
  }, []);

  const handleCompletarTarea = async (idTarea, nombreTarea) => {
    console.log('🎯 handleCompletarTarea EJECUTADA');
    console.log('📋 Parámetros recibidos:', { idTarea, nombreTarea });
    
    if (!idTarea) {
      console.log('❌ ERROR: idTarea es undefined o null');
      alert('Error: No se pudo identificar la tarea');
      return;
    }

    try {
      console.log('🔄 Enviando solicitud PUT...');
      
      const response = await fetch(`http://127.0.0.1:8000/api/tareas/${idTarea}/completar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📡 Respuesta recibida, status:', response.status);
      
      const data = await response.json();
      console.log('📦 Data de respuesta:', data);
      
      if (data.success) {
        alert(`✅ Tarea "${nombreTarea}" marcada como Finalizada`);
        // Actualizar estado...
      } else {
        alert(`❌ Error: ${data.mensaje}`);
      }
      
    } catch (error) {
      console.error('💥 Error en la solicitud:', error);
      alert('Error de conexión');
    }
  };

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

  const handleVerEvidencias = (proyecto) => {
    setProyectoActual(proyecto);
    setModalVisible(true);
    setIndiceActual(0);

    const evidenciasArray = proyecto.tareas
      .filter((t) => t.t_estatus && t.t_estatus.toLowerCase().includes('proceso'))
      .flatMap((t) => t.evidencias || []);

    const imagenes = evidenciasArray.filter((ev) =>
      ev.ruta_archivo && ev.ruta_archivo.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );

    console.log('🔍 Evidencias encontradas:', {
      proyecto: proyecto.p_nombre,
      totalTareas: proyecto.tareas.length,
      tareasConEvidencias: proyecto.tareas.filter(t => t.evidencias && t.evidencias.length > 0),
      totalEvidencias: evidenciasArray.length,
      imagenesEncontradas: imagenes.length
    });

    setEvidencias(imagenes);
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
  const totalProyectos = proyectos.length;
  const totalTareas = proyectos.reduce((total, p) => total + (p.total_tareas || 0), 0);
  const tareasCompletadas = proyectos.reduce((total, p) => total + (p.tareas_completadas || 0), 0);

  return (
    <div className="container-fluid p-0 tareas-proceso-global">

      <Header />
      <div className="container my-4">
        <div className="text-center mb-5">
          <h1 className="form-titulo mb-3">Proyectos en Proceso</h1>
        </div>
        <div className="tareas-proceso-stats-container mb-4">
          <div className="tareas-proceso-stat-card">
            <div className="stat-number">{totalProyectos}</div>
            <div className="stat-label-tp">Numero de proyectos</div>
          </div>
          <div className="tareas-proceso-stat-card">
            <div className="stat-number">{totalTareas}</div>
            <div className="stat-label-tp">Total de Tareas</div>
          </div>
          <div className="tareas-proceso-stat-card">
            <div className="stat-number">{tareasCompletadas}</div>
            <div className="stat-label-tp">Tareas Completadas</div>
          </div>
        </div>

    <div className="tareas-proceso-buscador-container flex">
  <div className="tareas-proceso-buscador-inner">
    <FiSearch className="tareas-proceso-icono-buscar-inline" />
    <input
      type="text"
      placeholder="Buscar proyectos por nombre..."
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      className="tareas-proceso-input-buscar-inline"
    />
    {busqueda && (
      <button className="tareas-proceso-clear-busqueda-inline" onClick={() => setBusqueda("")}>
        <FiX />
      </button>
    )}
  </div>
</div>
{busqueda && (
  <div className="tareas-proceso-resultados-info mb-3">
    <span>
     {proyectos.filter(p => p.p_nombre.toLowerCase().includes(busqueda.toLowerCase())).length} {" "}Resultado(s) para "{busqueda}"

    </span>
  </div>
)}


        <div className="tareas-proceso-lista">
          {loading ? (
            <div className="loader-container">
              <div className="loader-logo">
                <img src={logo3} alt="Cargando" />
              </div>
              <div className="loader-texto">CARGANDO...</div>
              <div className="oader-spinner"></div>
            </div>
          ) : proyectos.length > 0 ? (
            proyectos
              .filter((p) =>
                p.p_nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((p) => {
                const porcentajeCompletado = Math.round(((p.tareas_completadas || 0) / (p.total_tareas || 1)) * 100);
                
                return (
                  <div key={p.id_proyecto} className="tareas-proceso-card">
                    <div className="tareas-proceso-card-header">
                      <div className="tareas-proceso-tarea-header">
                        
<LuClock3 className="tareas-proceso-icono-estado en-proceso" />
                        <div className="tareas-proceso-proyecto-nombre">{p.p_nombre}</div>
                      </div>
                      
                      <div className="tareas-proceso-marcar-completado">
                        <label className="tareas-proceso-checkbox-label">
                          <input
                            type="checkbox"
                            title="Marcar proyecto como completado"
                            onChange={() => handleMarcarCompletado(p)}
                          />
                          <span className="tareas-proceso-checkbox-custom"></span>
                        </label>
                      </div>
                    </div>

                    {/* Información del Proyecto */}
                    <div className="tareas-proceso-info-tarea">
                      <div className="tareas-proceso-meta-info">
                        <div className="tareas-proceso-estado-container">
                          <span className={`tareas-proceso-estatus-badge ${p.p_estatus?.toLowerCase().replace(' ', '-')}`}>
                            {p.p_estatus}
                          </span>
                        </div>
                        
                        <div className="tareas-proceso-fechas">
                          <div className="tareas-proceso-fecha-item">
                            <span className="tareas-proceso-fecha-label">Vence:</span>
                            <span className="tareas-proceso-fecha-valor">{p.pf_fin}</span>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progreso */}
                      <div className="tareas-proceso-progress-container">
                        <div className="tareas-proceso-progress-info">
                          <span>Tareas: {p.tareas_completadas || 0} de {p.total_tareas || 0}</span>
                          <span>{porcentajeCompletado}%</span>
                        </div>
                        <div className="tareas-proceso-progress-bar">
                          <div 
                            className="tareas-proceso-progress-fill"
                            style={{ width: `${porcentajeCompletado}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="tareas-proceso-acciones">
                        <button
                          className="tareas-proceso-btn-ver"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerEvidencias(p);
                          }}
                        >
                           Ver Evidencias
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="tareas-proceso-empty-state">
              <div className="tareas-proceso-empty-icon">📋</div>
              <h3 className="tareas-proceso-empty-title">No hay proyectos en proceso</h3>
              <p className="tareas-proceso-empty-message">
                Todos los proyectos están completados o no tienes proyectos asignados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal (sin cambios) */}
      {modalVisible && (
        <div className="tareas-proceso-modal-preview">
          <div className="tareas-proceso-modal-content">
            <button className="tareas-proceso-modal-close" onClick={handleCerrarModal}>
              &times;
            </button>
            
            <div className="tareas-proceso-modal-header">
              <h2 className="tareas-proceso-modal-titulo">
                Evidencias de: {proyectoActual?.tareas.find(t => t.id_tarea === evidencias[indiceActual]?.id_tarea)?.t_nombre}
              </h2>
            </div>
            
            <div className="tareas-proceso-modal-body">
              <div className="tareas-proceso-imagen-area">
                {evidencias.length > 0 ? (
                  <>
                    <div className="tareas-proceso-modal-imagen-contenedor">
                      <img
                        src={`http://127.0.0.1:8000/storage/${evidencias[indiceActual].ruta_archivo}`}
                        alt={evidencias[indiceActual].ruta_archivo.split("/").pop()}
                      />
                      {evidencias.length > 1 && (
                        <>
                          <button className="tareas-proceso-modal-carrusel-btn" onClick={handlePrev}>
                            &#10094;
                          </button>
                          <button className="tareas-proceso-modal-carrusel-btn" onClick={handleNext}>
                            &#10095;
                          </button>
                        </>
                      )}
                    </div>
                    <p className="tareas-proceso-modal-indicador">
                      {indiceActual + 1} / {evidencias.length}
                    </p>
                    
                    {/* Botón DEBAJO de la imagen */}
                    {proyectoActual?.tareas.find(t => t.id_tarea === evidencias[indiceActual]?.id_tarea)?.t_estatus !== 'Finalizada' && (
                      <div className="tareas-proceso-boton-inferior">
                        <button 
                          className="tareas-proceso-btn-completar"
                          onClick={() => handleCompletarTarea(
                            evidencias[indiceActual]?.id_tarea,
                            proyectoActual?.tareas.find(t => t.id_tarea === evidencias[indiceActual]?.id_tarea)?.t_nombre
                          )}
                        >
                          <FaCheckCircle /> Marcar como Finalizada
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="tareas-proceso-modal-no-imagenes">No hay imágenes disponibles</p>
                )}
              </div>
            </div>
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
    </div>
  );
}

export default TareasenProceso;





