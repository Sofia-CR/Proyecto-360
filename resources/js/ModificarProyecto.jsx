import React, { useState, useRef, useEffect } from "react";
import Header from "./Header";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt, FaExclamationTriangle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/ModificarProyecto.css';

registerLocale("es", es);

// Modal de confirmación
const ModalConfirmacion = ({ mostrar, onConfirm, onCancel, titulo, mensaje, tipo = "peligro" }) => (
  mostrar && (
    <div className="modal-overlay">
      <div className="modal-confirmacion">
        <div className="modal-header">
          <FaExclamationTriangle className={`modal-icon ${tipo}`} />
          <h5 className="modal-titulo">{titulo}</h5>
        </div>
        <p className="modal-mensaje">{mensaje}</p>
        <div className="modal-botones">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${tipo === 'peligro' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  )
);

// Estado guardado
const EstadoGuardado = ({ tipo }) => (
  <div className="estado-guardado-wrapper mb-3">
    <div className={`estado-guardado ${tipo === 'guardado' ? 'guardado' : 'no-guardado'}`}>
      <span className="indicador"></span>
      {tipo === 'guardado' ? 'Todos los cambios guardados' : 'Cambios sin guardar'}
    </div>
  </div>
);

// Botón de calendario reutilizable
const CalendarButton = React.forwardRef(({ value, onClick, hasError, disabled }, ref) => (
  <button
    type="button"
    className={`btn-calendario w-100 d-flex align-items-center gap-2 ${hasError ? 'border-danger' : ''} ${disabled ? 'opacity-50' : ''}`}
    onClick={onClick}
    ref={ref}
    disabled={disabled}
  >
    <FaCalendarAlt className={!value ? "text" : ""} />
    <span className={!value ? "text" : ""}>
      {value || "Seleccionar fecha"}
    </span>
  </button>
));

// Selector de fecha
const SelectorFecha = ({ label, selected, onChange, minDate, error, disabled, onBlur }) => (
  <div className="fecha-item mb-3 d-flex flex-column">
    <label className="form-label fw-bold mb-1">{label}</label>
    <DatePicker
      selected={selected}
      onChange={onChange}
      onBlur={onBlur}
      dateFormat="dd/MM/yyyy"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      locale="es"
      minDate={minDate}
      customInput={<CalendarButton hasError={!!error} value={selected} disabled={disabled} />}
      disabled={disabled}
      popperPlacement="bottom-start"
    />
    {error && <small className="modificarproyecto-error">{error}</small>}
  </div>
);

function ModificarProyecto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { idProyecto } = location.state || {};

  const nombreProyectoRef = useRef(null);
  const descripcionProyectoRef = useRef(null);

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [proyectoCargado, setProyectoCargado] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [camposModificados, setCamposModificados] = useState({});
  const [errorServidor, setErrorServidor] = useState(null);
  const [datosOriginales, setDatosOriginales] = useState(null);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [mostrarEstado, setMostrarEstado] = useState(false);

  const [touched, setTouched] = useState({
    fechaInicio: false,
    fechaFin: false,
  });

  // Ajusta altura de los textarea
  const ajustarAltura = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    ajustarAltura(nombreProyectoRef);
    ajustarAltura(descripcionProyectoRef);
  }, []);

  // Carga del proyecto
  useEffect(() => {
    if (idProyecto && !proyectoCargado) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/proyectos/${idProyecto}`)
        .then(res => res.ok ? res.json() : Promise.reject("Error al cargar"))
        .then(data => {
          if (!data.success) return alert("No se pudo cargar el proyecto");

          const proyecto = data.proyecto;
          setDatosOriginales(proyecto);

          if (nombreProyectoRef.current) nombreProyectoRef.current.value = proyecto.p_nombre || '';
          if (descripcionProyectoRef.current) descripcionProyectoRef.current.value = proyecto.descripcion || '';
          if (proyecto.pf_inicio) setFechaInicio(new Date(proyecto.pf_inicio));
          if (proyecto.pf_fin) setFechaFin(new Date(proyecto.pf_fin));

          ajustarAltura(nombreProyectoRef);
          ajustarAltura(descripcionProyectoRef);
          setProyectoCargado(true);
        })
        .catch(err => {
          console.error(err);
          setErrorServidor("Error al cargar los datos del proyecto");
        })
        .finally(() => setLoading(false));
    }
  }, [idProyecto, proyectoCargado]);

  // Verifica cambios
  const verificarCambios = () => {
    if (!datosOriginales || !proyectoCargado) return false;

    const cambios = {};
    const nombre = nombreProyectoRef.current?.value.trim() || '';
    const descripcion = descripcionProyectoRef.current?.value.trim() || '';

    if (nombre !== datosOriginales.p_nombre) cambios.nombre = true;
    if (descripcion !== datosOriginales.descripcion) cambios.descripcion = true;
    if (fechaInicio?.getTime() !== new Date(datosOriginales.pf_inicio).getTime()) cambios.fechaInicio = true;
    if (fechaFin?.getTime() !== new Date(datosOriginales.pf_fin).getTime()) cambios.fechaFin = true;

    setCamposModificados(cambios);
    setMostrarEstado(Object.keys(cambios).length > 0 || guardadoExitoso);
    return Object.keys(cambios).length > 0;
  };

  // Detectar cambios en fechas y campos
  useEffect(() => {
    if (proyectoCargado) verificarCambios();
  }, [fechaInicio, fechaFin]);

  const handleInputChange = (campo) => {
    setErrores(prev => ({ ...prev, [campo]: null }));
    setErrorServidor(null);
    setTimeout(() => verificarCambios(), 500);
  };

  const validarFechas = (inicio, fin) => {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    if (!touched.fechaInicio && !touched.fechaFin) return null;

    if (inicio && inicio < hoy) return "La fecha de inicio no puede ser anterior a hoy";
    if (inicio && fin && fin < inicio) return "La fecha de fin no puede ser anterior a la fecha de inicio";

    if (inicio && fin) {
      const dosAnios = new Date(inicio);
      dosAnios.setFullYear(dosAnios.getFullYear() + 2);
      if (fin > dosAnios) return "La fecha de fin no puede ser más de 2 años después de la fecha de inicio";
    }

    return null;
  };

  const validarFormulario = () => {
    const nombre = nombreProyectoRef.current?.value.trim() || '';
    const descripcion = descripcionProyectoRef.current?.value.trim() || '';
    const inicio = fechaInicio;
    const fin = fechaFin;

    const nuevosErrores = {};
    if (!nombre) nuevosErrores.nombre = "El nombre del proyecto es obligatorio.";
    else if (nombre.length < 3) nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres.";
    else if (nombre.length > 100) nuevosErrores.nombre = "El nombre no puede exceder los 100 caracteres.";

    if (!descripcion) nuevosErrores.descripcion = "La descripción es obligatoria.";
    else if (descripcion.length < 10) nuevosErrores.descripcion = "La descripción debe tener al menos 10 caracteres.";
    else if (descripcion.length > 500) nuevosErrores.descripcion = "La descripción no puede exceder los 500 caracteres.";

    if (!inicio) nuevosErrores.inicio = "Selecciona la fecha de inicio.";
    if (!fin) nuevosErrores.fin = "Selecciona la fecha de fin.";

    const errorFechas = validarFechas(inicio, fin);
    if (errorFechas) nuevosErrores.fechas = errorFechas;

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleModificar = async () => {
    if (!validarFormulario()) return;
    try {
      setLoading(true); setErrorServidor(null);

      const nombre = nombreProyectoRef.current?.value.trim() || '';
      const descripcion = descripcionProyectoRef.current?.value.trim() || '';

      const res = await fetch(`http://127.0.0.1:8000/api/proyectos/${idProyecto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          p_nombre: nombre,
          descripcion: descripcion,
          pf_inicio: `${fechaInicio.getFullYear()}-${String(fechaInicio.getMonth()+1).padStart(2,'0')}-${String(fechaInicio.getDate()).padStart(2,'0')}`,
          pf_fin: `${fechaFin.getFullYear()}-${String(fechaFin.getMonth()+1).padStart(2,'0')}-${String(fechaFin.getDate()).padStart(2,'0')}`
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Error al actualizar');
      }

      setCamposModificados({});
      setGuardadoExitoso(true);
      setMostrarEstado(true);

      setTimeout(() => {
        setGuardadoExitoso(false);
        setMostrarEstado(false);
      }, 2000);

    } catch (error) {
      console.error(error);
      setErrorServidor(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (Object.keys(camposModificados).length > 0) setMostrarConfirmacion(true);
    else navigate("/ProyectosM");
  };

  const confirmarCancelar = () => navigate("/Proyectos");
  const cancelarCancelar = () => setMostrarConfirmacion(false);

  return (
    <div className="app-global">
      <Header />

      <div className="container my-4">
        <h1 className="text-center mb-4 form-titulo">Modificar Proyecto</h1>

        {mostrarEstado && <EstadoGuardado tipo={guardadoExitoso ? 'guardado' : 'no-guardado'} />}

        {errorServidor && <div className="alert alert-danger">{errorServidor}</div>}

        <div className="modificarproyecto-contenedor">
          <div className="mb-3">
            <label className="form-label fw-bold">Nombre del proyecto</label>
            <textarea
              ref={nombreProyectoRef}
              onChange={() => handleInputChange('nombre')}
              onInput={() => ajustarAltura(nombreProyectoRef)}
              className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
              rows={1}
              placeholder="Nombre del proyecto"
            />
            {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Descripción</label>
            <textarea
              ref={descripcionProyectoRef}
              onChange={() => handleInputChange('descripcion')}
              onInput={() => ajustarAltura(descripcionProyectoRef)}
              className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
              rows={3}
              placeholder="Descripción del proyecto"
            />
            {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
          </div>

          <div className="fechas-container d-flex gap-3">
            <SelectorFecha
              label="Fecha de inicio"
              selected={fechaInicio}
              onChange={(date) => { setFechaInicio(date); setTouched(prev => ({...prev, fechaInicio: true})); }}
              minDate={new Date()}
              error={errores.inicio || errores.fechas}
              onBlur={() => verificarCambios()}
            />
            <SelectorFecha
              label="Fecha de fin"
              selected={fechaFin}
              onChange={(date) => { setFechaFin(date); setTouched(prev => ({...prev, fechaFin: true})); }}
              minDate={fechaInicio || new Date()}
              error={errores.fin || errores.fechas}
              onBlur={() => verificarCambios()}
            />
          </div>
</div>
          <div className="d-flex flex-column flex-md-row gap-2 justify-content-center mt-3">
            <button 
              type="button"
              className="btn-modificar cancelar"
              onClick={handleCancelar}
              disabled={loading}
            >
              Cancelar
            </button>

            <button 
              type="button"
              className="btn-modificar guardar"
              onClick={handleModificar}
              disabled={loading || Object.keys(camposModificados).length === 0} 
            >
              {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando…</> : "Guardar Cambios"}
            </button>
          </div>
        </div>

        <ModalConfirmacion
          mostrar={mostrarConfirmacion}
          onConfirm={confirmarCancelar}
          onCancel={cancelarCancelar}
          titulo="¿Descartar cambios?"
          mensaje="Tienes cambios sin guardar. Si cancelas, perderás todos los cambios realizados."
          tipo="peligro"
        />
      </div>

  );
}

export default ModificarProyecto;













