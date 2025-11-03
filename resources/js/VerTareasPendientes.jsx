import Header from "./Header";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { LuClock3 } from "react-icons/lu";
import "../css/VerTareasPendientes.css";

function VerTareasPendientes() {
  const [proyecto, setProyecto] = useState(null);
  const [tareaActual, setTareaActual] = useState(null);
  const [evidencias, setEvidencias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [imagenCargando, setImagenCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const proyectoGuardado = sessionStorage.getItem("proyectoSeleccionado");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!proyectoGuardado || !usuario?.id_usuario) {
      return navigate("/tareas-en-proceso");
    }

    const proyectoSeleccionado = JSON.parse(proyectoGuardado);
    setProyecto(proyectoSeleccionado);

    fetch(`http://127.0.0.1:8000/api/tareas-proyectos-jefe?usuario=${usuario.id_usuario}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const proyectoCompleto = data.proyectos.find(p => p.id_proyecto === proyectoSeleccionado.id_proyecto);
          if (proyectoCompleto) setProyecto(proyectoCompleto);
        }
      })
      .catch(err => console.error("Error al obtener tareas:", err));
  }, [navigate]);

  // Función para completar tarea
  const handleCompletarTarea = async (idTarea) => {
    if (!idTarea) return;

    try {
      setCargando(true);
      const response = await fetch(`http://127.0.0.1:8000/api/tareas/${idTarea}/completar`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar estado local
        setProyecto(prev => ({
          ...prev,
          tareas: prev.tareas.map(t =>
            t.id_tarea === idTarea 
              ? { ...t, t_estatus: "Finalizada" } 
              : t
          )
        }));
        
        // Cerrar modal después de completar
        handleCerrarModal();
        alert("Tarea marcada como finalizada exitosamente");
      } else {
        alert(`Error: ${data.mensaje}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  const handleVerEvidencias = (tarea) => {
    setTareaActual(tarea);
    setEvidencias(tarea.evidencias || []);
    setIndiceActual(0);
    setImagenCargando(true);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setTareaActual(null);
    setEvidencias([]);
    setIndiceActual(0);
    setImagenCargando(false);
  };

  const handlePrev = () => {
    if (evidencias.length <= 1) return;
    setImagenCargando(true);
    setIndiceActual(prev => (prev === 0 ? evidencias.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (evidencias.length <= 1) return;
    setImagenCargando(true);
    setIndiceActual(prev => (prev === evidencias.length - 1 ? 0 : prev + 1));
  };

  // Función para manejar la carga de imágenes
  const handleImageLoad = () => {
    setImagenCargando(false);
  };

  const handleImageError = (e) => {
    console.error("Error cargando imagen:", evidencias[indiceActual]);
    setImagenCargando(false);
    e.target.style.display = 'none';
  };

  // Función para obtener la clase de estatus
  const getStatusClass = (estatus) => {
    if (!estatus) return '';
    return estatus.toLowerCase().replace(/\s+/g, '-');
  };

  const tareasFiltradas = proyecto?.tareas?.filter(t =>
    t.t_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!proyecto) return null;

  return (
    <div className="container-fluid p-0 vtp-global">
      <Header />

      <div className="container my-4">
        <h1 className="form-titulo">
          Tareas del proyecto: <span style={{color: '#861542'}}>{proyecto.p_nombre}</span>
        </h1>

        {/* Buscador */}
        <div className="vtp-buscador-contenedor">
          <div className="vtp-buscador-inner">
            <input
              type="text"
              placeholder="Buscar tarea..."
              className="vtp-buscador-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button 
                className="vtp-buscador-clear"
                onClick={() => setBusqueda('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="vtp-contenedor-buscador-y-tarjetas">
          <div className="vtp-lista-tareas">
            {tareasFiltradas?.length > 0 ? (
              tareasFiltradas.map(t => (
                <div key={t.id_tarea} className="vtp-item-tarea">
                  <div className="vtp-tarea-header">
                    <LuClock3 className="vtp-icono-pendiente" />
                    <span className="vtp-tarea-nombre">{t.t_nombre}</span>
                  </div>
                  <div className="vtp-tarea-footer">
                    <span className={`vtp-tarea-estatus ${getStatusClass(t.t_estatus)}`}>
                      {t.t_estatus}
                    </span>
                    <span className="vtp-tarea-fecha">Vence: {t.tf_fin || t.fechaVencimiento}</span>
                    <button
                      className="vtp-btn-evidencias"
                      onClick={() => handleVerEvidencias(t)}
                    >
                      Ver Evidencias ({t.evidencias?.length || 0})
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="vtp-no-tareas-mensaje">
                <LuClock3 style={{fontSize: '3rem', color: '#861542', marginBottom: '15px'}} />
                <h3 style={{color: '#861542', marginBottom: '10px'}}>
                  {busqueda ? 'No hay tareas que coincidan con la búsqueda' : 'No hay tareas pendientes'}
                </h3>
                <p style={{color: '#6c757d'}}>
                  {busqueda ? 'Intenta con otros términos de búsqueda' : 'Todas las tareas están completadas o no hay tareas asignadas'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Botón Volver */}
        <div style={{textAlign: 'center', marginTop: '30px'}}>
          <button className="vtp-btn-volver" onClick={() => navigate("/tareas-en-proceso")}>
            Volver a proyectos
          </button>
        </div>

     // Modal de evidencias - VERSIÓN MEJORADA CON NAVEGACIÓN
{modalVisible && tareaActual && (
  <div className="vtp-modal">
    <div className="vtp-modal-content">
      <button className="vtp-modal-cerrar" onClick={handleCerrarModal}>
        <FiX />
      </button>
      
      <div className="vtp-modal-header">
        <h3>{tareaActual.t_nombre}</h3>
        <span className={`vtp-modal-estatus ${getStatusClass(tareaActual.t_estatus)}`}>
          {tareaActual.t_estatus}
        </span>
      </div>

      {evidencias.length > 0 ? (
        <div className="vtp-evidencias-container">
          {/* Navegación - MEJORADA */}
          <div className="vtp-evidencias-navegacion">
            {evidencias.length > 1 && (
              <button 
                className="vtp-btn-navegacion vtp-btn-prev" 
                onClick={handlePrev}
                aria-label="Imagen anterior"
              >
                ◀
              </button>
            )}
            
            <div className="vtp-imagen-container">
              {imagenCargando && <div className="vtp-imagen-cargando"></div>}
              <img
                src={`http://127.0.0.1:8000/storage/${evidencias[indiceActual].ruta_archivo}`}
                alt={`Evidencia ${indiceActual + 1} de ${tareaActual.t_nombre}`}
                className="vtp-imagen-evidencia"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imagenCargando ? 'none' : 'block' }}
              />
            </div>

            {evidencias.length > 1 && (
              <button 
                className="vtp-btn-navegacion vtp-btn-next" 
                onClick={handleNext}
                aria-label="Siguiente imagen"
              >
                ▶
              </button>
            )}
          </div>

          {/* Contador de imágenes */}
          {evidencias.length > 1 && (
            <div className="vtp-contador">
              <span>{indiceActual + 1} / {evidencias.length}</span>
            </div>
          )}

          {/* Información de la evidencia */}
          <div className="vtp-evidencias-info">
            <span className="vtp-tarea-fecha">
              Subido: {evidencias[indiceActual]?.created_at || 'Fecha no disponible'}
            </span>
          </div>

          {/* Botón para completar tarea */}
          {tareaActual.t_estatus !== 'Finalizada' && (
            <div className="vtp-acciones">
              <button
                className="vtp-btn-completar"
                onClick={() => handleCompletarTarea(tareaActual.id_tarea)}
                disabled={cargando}
              >
                {cargando ? '⏳ Marcando...' : '✅ Marcar como Finalizada'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="vtp-sin-evidencias">
          <div style={{fontSize: '4rem', color: '#dee2e6', marginBottom: '20px'}}>🖼️</div>
          <h3 style={{color: '#6c757d', marginBottom: '15px'}}>No hay evidencias</h3>
          <p style={{color: '#868e96', marginBottom: '25px'}}>
            Esta tarea no tiene evidencias adjuntas todavía.
          </p>
          
          {tareaActual.t_estatus !== 'Finalizada' && (
            <div className="vtp-acciones">
              <button
                className="vtp-btn-completar"
                onClick={() => handleCompletarTarea(tareaActual.id_tarea)}
                disabled={cargando}
              >
                {cargando ? '⏳ Marcando...' : '✅ Marcar como Finalizada'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default VerTareasPendientes;