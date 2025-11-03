import React, { useState, useEffect, useRef } from "react";
import { 
  FaUpload, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaFileAlt,
  FaCalendarDay,
  FaAngleDown
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import logo3 from "../imagenes/logo3.png";
import "../css/tareasusuario.css"; 

function TareasUsuario() {
  const [subiendo, setSubiendo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [tareaActual, setTareaActual] = useState(null);
  const [proyectoActual, setProyectoActual] = useState(null);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [open, setOpen] = useState(false);
  const refs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      console.log("No autenticado - redirigiendo al login");
      navigate("/Login", { replace: true });
      return;
    }

    const idProyecto = localStorage.getItem("id_proyecto");
    const nombre = localStorage.getItem("nombre_proyecto");
    
    if (idProyecto) {
      setProyectoActual({ id_proyecto: idProyecto });
      setNombreProyecto(nombre || "Proyecto");
    } else {
      console.error("No se encontró un proyecto seleccionado.");
    }
  }, [navigate]);

  const fetchTareas = async () => {
    const token = localStorage.getItem("jwt_token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!token) {
      console.error("Token no disponible");
      navigate("/Login", { replace: true });
      return;
    }

    if (!usuario) return console.error("No se encontró información del usuario.");
    if (!proyectoActual) return setTareas([]);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/tareas/${proyectoActual.id_proyecto}/usuario/${usuario.id_usuario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (res.status === 401) {
        console.warn("Token inválido o expirado (401). Redirigiendo a login.");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("usuario");
        navigate("/Login", { replace: true });
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        return console.error("Error en la API:", res.status, errorText);
      }

      const data = await res.json();
      if (data.success) setTareas(data.tareas);
      else console.error("No se pudieron obtener las tareas.");
    } catch (err) {
      console.error("Error al cargar tareas:", err);
    }
  };

  useEffect(() => {
    if (proyectoActual) {
      setLoading(true);
      fetchTareas().finally(() => setLoading(false));
    }
  }, [proyectoActual]);

  const getUrgenciaTarea = (fechaFin) => {
    const ahora = new Date();
    const fin = new Date(fechaFin);

    if (fin < ahora) {
        return { nivel: "vencida", icono: <FaExclamationTriangle />, texto: "Vencida" };
    } else if (
        fin.getFullYear() === ahora.getFullYear() &&
        fin.getMonth() === ahora.getMonth() &&
        fin.getDate() === ahora.getDate()
    ) {
        return { nivel: "venceHoy", icono: <FaClock />, texto: "Vence hoy" };
    } else {
        return { nivel: "proxima", icono: <FaClock />, texto: "Próxima a vencer" };
    }
};

// Determina el estado de la tarea
const getEstadoTarea = (estatus) => {
    switch(estatus) {
        case "En proceso": return { clase: "en-proceso", icono: <FaClock />, texto: "En Proceso" };
        default: return { clase: "completada", icono: <FaFileAlt />, texto: estatus };
    }
};

  const handleClickArchivo = (id) => {
    setTareaActual(id);
    if (!refs.current[id]) refs.current[id] = React.createRef();
    refs.current[id].click();
  };

  const handleArchivoChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const tiposPermitidos = ['image/*'];
  if (!file.type.startsWith('image/')) 
      return alert("Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP, etc.)");

  setArchivoSeleccionado({ 
    file, 
    url: URL.createObjectURL(file),
    tipo: file.type
  });
};


  const handleCancelar = () => {
    setArchivoSeleccionado(null);
    setTareaActual(null);
    Object.values(refs.current).forEach(ref => { if (ref) ref.value = ''; });
  };

  const handleUpload = async () => {
  if (!archivoSeleccionado || !proyectoActual) return;

  const token = localStorage.getItem("jwt_token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!token) {
    alert("Sesión expirada. Por favor, inicie sesión nuevamente.");
    navigate("/Login");
    return;
  }
  if (!usuario) return alert("No se encontró información del usuario.");

  const formData = new FormData();
  formData.append("id_proyecto", proyectoActual.id_proyecto);
  formData.append("id_tarea", tareaActual);
  formData.append("id_departamento", usuario.id_departamento);
  formData.append("id_usuario", usuario.id_usuario);
  formData.append("ruta_archivo", archivoSeleccionado.file);

  try {
    setSubiendo(true); // 🔹 aquí cambiamos a subiendo
    const res = await fetch("http://127.0.0.1:8000/api/evidencias", { 
      method: "POST", 
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("usuario");
      navigate("/Login", { replace: true });
      return;
    }

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success) {

      handleCancelar();
      await fetchTareas();
    } else {
      alert(`Error al subir el archivo: ${data?.message || "Intente nuevamente"}`);
    }
  } catch (error) {
    alert("Error de conexión. Verifique su internet e intente nuevamente.");
  } finally {
    setSubiendo(false); // 🔹 aquí también
  }
};


  const tareasFiltradas = tareas.filter(tarea => {
    const urgencia = getUrgenciaTarea(tarea.tf_fin);
    if (filtroEstado === "todas") return true;
    if (filtroEstado === "vencidas") return urgencia.nivel === "vencida";
    if (filtroEstado === "urgentes") return urgencia.nivel === "urgente";
    if (filtroEstado === "proximas") return urgencia.nivel === "proxima";
    return true;
  });

  const renderContenido = () => {
    if (loading) return (
     <div className="loader-container">
                     <div className="loader-logo">
                       <img src={logo3} alt="Cargando proyectos" />
                     </div>
                     <div className="loader-texto">CARGANDO...</div>
                     <div className="loader-spinner"></div>
                   </div>
    );

    if (!proyectoActual) return (
      <div className="empty-state">
        <FaExclamationTriangle className="empty-icon" />
        <h3 className="empty-title">Proyecto no encontrado</h3>
        <p className="empty-message">No se pudo cargar la información del proyecto.</p>
      </div>
    );

    if (tareasFiltradas.length === 0) return (
      <div className="empty-state">
        <FaFileAlt className="empty-icon" />
        <h3 className="empty-title">
          {filtroEstado === "todas" ? "No hay tareas asignadas" : `No hay tareas ${filtroEstado.toLowerCase()}`}
        </h3>
        <p className="empty-message">
          {filtroEstado === "todas" ? "No tienes tareas asignadas en este proyecto." : "No hay tareas con este estado en el proyecto."}
        </p>
      </div>
    );
    return (
      <div className="tareas-contenedor">
        <div className="tareas-lista">
          {tareasFiltradas.map((tarea) => {
            const urgencia = getUrgenciaTarea(tarea.tf_fin);
const estado = getEstadoTarea(tarea.t_estatus);

            
            return (
              <div key={tarea.id_tarea} className={`tarea-card ${tarea.t_estatus.toLowerCase().replace(' ', '-')} ${urgencia.nivel === "vencida" ? "tarea-vencida" : ""}`}>
                <div className="tarea-header">
                  <div className="tarea-titulo-container">
                    <h3 className="tarea-nombre">{tarea.t_nombre}</h3>
                    <div className="tarea-badges">
                      <span className={`badge-estado ${estado.clase}`}>
  {estado.icono}{estado.texto}
</span>
                    <span className={`badge-urgencia ${urgencia.nivel}`}>
  {urgencia.icono}{urgencia.texto}
</span>
                    </div>
                  </div>
                  <button className="btn-subir-evidencia" onClick={() => handleClickArchivo(tarea.id_tarea)} title="Subir evidencia">
                    <FaUpload className="btn-icon" /> Subir
                  </button>
                </div>

                <div className="tarea-detalles">
                  <div className="detalle-item">
                    <FaCalendarDay className="detalle-icon" />
                    <span className="detalle-texto">Vence: <strong>{new Date(tarea.tf_fin).toLocaleDateString('es-ES')}</strong></span>
                  </div>
                  <div className="detalle-item">
                    <FaFileAlt className="detalle-icon" />
                    <span className="detalle-texto">Evidencias: <strong>{tarea.evidencias_count || 0}</strong></span>
                  </div>
                </div>

                <input 
  type="file" 
  ref={(el) => (refs.current[tarea.id_tarea] = el)} 
  style={{ display: "none" }} 
  onChange={handleArchivoChange} 
  accept="image/*"
/>

              </div>
            );
          })}
        </div>
      </div>
    );
  };
const tareaSeleccionada = tareas.find(t => t.id_tarea === tareaActual);

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="proyecto-header-section">
              <h1 className="form-titulo">{nombreProyecto}</h1>
            </div>
            <div className="filtros-container">
              <div className="filtros-inner">
                <div className="filtro-left">
                  <label className="filtro-label-inline">Filtrar por estado:</label>
                  <div className="custom-select-container-inline">
                    <div className="custom-select" onClick={() => setOpen(!open)}>
                      {filtroEstado === "todas" ? "Todas las tareas" :
                       filtroEstado === "vencidas" ? "Retrasadas" :
                       filtroEstado === "urgentes" ? "Urgentes (vence hoy)" :
                       "Próximas"}
                      <FaAngleDown className={`dropdown-icon ${open ? "open" : ""}`} />
                    </div>

                    {open && (
                      <div className="custom-options-inline open">
                        <div onClick={() => { setFiltroEstado("todas"); setOpen(false); }}>Todas las tareas</div>
                        <div onClick={() => { setFiltroEstado("vencidas"); setOpen(false); }}>Retrasadas</div>
                        <div onClick={() => { setFiltroEstado("urgentes"); setOpen(false); }}>Urgentes (vence hoy)</div>
                        <div onClick={() => { setFiltroEstado("proximas"); setOpen(false); }}>Próximas</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tareas-stats">
                  <span className="stat-total">Total: {tareasFiltradas.length}</span>
                </div>
              </div>
            </div>

            {renderContenido()}
          </div>
        </div>
      </div>
      {archivoSeleccionado && tareaSeleccionada && (
  <div className="modal-preview">
    <div className="modal-content-preview">
      <div className="modal-header">
        <h2>Evidencia de: {tareaSeleccionada.t_nombre}</h2> 
        <button className="modal-close" onClick={handleCancelar}>&times;</button>
      </div>
      <div className="modal-body">
        <img src={archivoSeleccionado.url} alt={archivoSeleccionado.file.name} />
      </div>
      <div className="modal-description">
        {archivoSeleccionado.file.name} - Vista previa del archivo seleccionado.
      </div>
      <div className="modal-footer">
  <button className="btn-cancelar" onClick={handleCancelar}>
    Cancelar
  </button>

 <button className="btn-subir" onClick={handleUpload} disabled={subiendo}>
  {subiendo ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Subiendo...
    </>
  ) : (
    "Subir"
  )}
</button>

</div>

    </div>
  </div>
)}


    </div>
  );
}

export default TareasUsuario;





















