import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Header from "./Header";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "../css/global.css";

// Botón personalizado para DatePicker
const CalendarButton = React.forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    className="btn-calendario w-100 d-flex align-items-center gap-2"
    onClick={onClick}
    ref={ref}
  >
    <FaCalendarAlt className={!value ? "text" : ""} />
    <span className={!value ? "text" : ""}>{value || "Seleccionar fecha"}</span>
  </button>
));

function AgregarTareas() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id_usuario, id_proyecto, id_departamento_inicial } = location.state || {};

  const nombreTareaRef = useRef(null);
  const descripcionTareaRef = useRef(null);

  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(id_departamento_inicial || "");
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [errores, setErrores] = useState({});
  const [tareaGuardada, setTareaGuardada] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idTareaRecienCreada, setIdTareaRecienCreada] = useState(null);

  const [minFecha, setMinFecha] = useState(null);
  const [maxFecha, setMaxFecha] = useState(null);
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Fechas del proyecto
  useEffect(() => {
    if (!id_proyecto) return;
    axios
      .get(`/api/proyectos/${id_proyecto}/fechasProyecto`, { headers: getAuthHeaders() })
      .then(res => {
        if (res.data.success) {
          setMinFecha(new Date(res.data.pf_inicio));
          setMaxFecha(new Date(res.data.pf_fin));
        }
      })
      .catch(err => console.error(err));
  }, [id_proyecto]);
  const ajustarAltura = ref => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  // Cargar departamentos
  useEffect(() => {
    axios
      .get("/api/CatalogoDepartamentos", { headers: getAuthHeaders() })
      .then(res => {
        setDepartamentos(res.data);
        if (id_departamento_inicial) {
          setDepartamentoSeleccionado(parseInt(id_departamento_inicial));
        } else if (res.data.length > 0) {
          setDepartamentoSeleccionado(res.data[0].id_departamento);
        }
      })
      .catch(err => console.error(err));
  }, [id_departamento_inicial]);

  // Cargar usuarios según departamento
  useEffect(() => {
    if (!departamentoSeleccionado) return;
    axios
      .get(`/api/departamentos/${departamentoSeleccionado}/usuarios`, { headers: getAuthHeaders() })
      .then(res => {
        setUsuarios(res.data);
        setUsuarioSeleccionado("");
      })
      .catch(err => {
        console.error(err);
        setUsuarios([]);
        setUsuarioSeleccionado("");
      });
  }, [departamentoSeleccionado]);

  // Manejo de errores al escribir
  const handleInputChange = campo => setErrores(prev => ({ ...prev, [campo]: null }));

  // Guardar tarea
  const handleGuardar = async () => {
    const nombre = nombreTareaRef.current.value.trim();
    const descripcion = descripcionTareaRef.current.value.trim();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const nuevosErrores = {};
    if (!nombre) nuevosErrores.nombre = "El nombre de la tarea es obligatorio.";
    if (!descripcion) nuevosErrores.descripcion = "La descripción es obligatoria.";
    if (!fechaInicio) nuevosErrores.inicio = "Selecciona la fecha de inicio.";
    else if (fechaInicio < hoy) nuevosErrores.inicio = "La fecha de inicio no puede ser anterior a hoy.";
    if (!fechaFin) nuevosErrores.fin = "Selecciona la fecha de fin.";
    else if (fechaInicio && fechaFin < fechaInicio) nuevosErrores.fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    if (!usuarioSeleccionado) nuevosErrores.usuario = "Selecciona un usuario.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const nuevaTarea = {
      id_usuario: parseInt(usuarioSeleccionado),
      id_proyecto,
      t_nombre: nombre,
      descripcion,
      tf_inicio: fechaInicio.toISOString().split("T")[0],
      tf_fin: fechaFin.toISOString().split("T")[0],
      id_departamento: parseInt(departamentoSeleccionado),
    };

    try {
      setLoading(true);
      const res = await axios.post("/api/tareas", nuevaTarea, { headers: getAuthHeaders() });
      if (res.data.success) {
        setIdTareaRecienCreada(res.data.id);
        nombreTareaRef.current.value = "";
        descripcionTareaRef.current.value = "";
        setFechaInicio(null);
        setFechaFin(null);
        setUsuarioSeleccionado("");
        setErrores({});
        setTareaGuardada(true);
      } else {
        console.error("Error al guardar la tarea");
      }
    } catch (err) {
      console.error("Error al guardar la tarea", err);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar tarea
  const handleCancelar = () => {
    nombreTareaRef.current.value = "";
    descripcionTareaRef.current.value = "";
    setFechaInicio(null);
    setFechaFin(null);
    setUsuarioSeleccionado("");
    setErrores({});
    setTareaGuardada(false);
    setIdTareaRecienCreada(null);
  };

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 agregartareas-input-container">
            <h1 className="text-center mb-4 form-titulo">Nueva Tarea</h1>

            {/* Nombre */}
            <div className="mb-3 d-flex flex-column">
              <label htmlFor="nombreTarea" className="form-label fw-bold">Nombre de la tarea</label>
              <textarea
                id="nombreTarea"
                ref={nombreTareaRef}
                className="form-control form-input"
                placeholder="Escribe el nombre de la tarea"
                rows={1}
                onInput={() => { ajustarAltura(nombreTareaRef); handleInputChange("nombre"); }}
              />
              {errores.nombre && <small className="error">{errores.nombre}</small>}
            </div>

            {/* Descripción */}
            <div className="mb-3 d-flex flex-column">
              <label htmlFor="descripcionTarea" className="form-label fw-bold">Descripción</label>
              <textarea
                id="descripcionTarea"
                ref={descripcionTareaRef}
                className="form-control form-input"
                placeholder="Escribe la descripción"
                rows={2}
                onInput={() => { ajustarAltura(descripcionTareaRef); handleInputChange("descripcion"); }}
              />
              {errores.descripcion && <small className="error">{errores.descripcion}</small>}
            </div>

            {/* Departamento */}
            <div className="mb-3 d-flex flex-column">
              <label htmlFor="departamento" className="form-label fw-bold">Departamento</label>
              <select
                id="departamento"
                value={departamentoSeleccionado}
                onChange={(e) => setDepartamentoSeleccionado(parseInt(e.target.value))}
                className="form-select"
              >
                {departamentos.map(d => (
                  <option key={d.id_departamento} value={d.id_departamento}>
                    {d.d_nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuario */}
            <div className="mb-3 d-flex flex-column">
              <label htmlFor="usuario" className="form-label fw-bold">Usuario</label>
              <select
                id="usuario"
                value={usuarioSeleccionado}
                onChange={(e) => { setUsuarioSeleccionado(e.target.value); handleInputChange("usuario"); }}
                className="form-select"
              >
                <option value="">Seleccionar usuario</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {`${u.nombre} ${u.apaterno} ${u.amaterno}`.split(" ")
                      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                      .join(" ")}
                  </option>
                ))}
              </select>
              {errores.usuario && <small className="error">{errores.usuario}</small>}
            </div>

            {/* Fechas */}
            <div className="row mb-3">
              <div className="col-12 col-md-6 mb-3 d-flex flex-column">
                <label className="form-label fw-bold mb-1">Fecha de inicio</label>
                <DatePicker
                  selected={fechaInicio}
                  onChange={date => { setFechaInicio(date); handleInputChange("inicio"); }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  locale="es"
                  minDate={minFecha}
                  maxDate={fechaFin || maxFecha}
                  customInput={<CalendarButton />}
                />
                {errores.inicio && <small className="error">{errores.inicio}</small>}
              </div>
              <div className="col-12 col-md-6 mb-3 d-flex flex-column">
                <label className="form-label fw-bold mb-1">Fecha de fin</label>
                <DatePicker
                  selected={fechaFin}
                  onChange={date => { setFechaFin(date); handleInputChange("fin"); }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  locale="es"
                  minDate={fechaInicio || minFecha}
                  maxDate={maxFecha}
                  customInput={<CalendarButton />}
                />
                {errores.fin && <small className="error">{errores.fin}</small>}
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
              <button type="button" className="btn-form w-100 w-md-auto" onClick={handleCancelar} disabled={loading}>
                Cancelar
              </button>
              <button type="button" className="btn-form w-100 w-md-auto" onClick={handleGuardar} disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                {loading ? "Guardando…" : "Guardar Tarea"}
              </button>
            </div>

            {/* Ver tarea */}
            {tareaGuardada && (
              <div className="mt-3 text-center">
                <button type="button" className="btn-form" onClick={() => navigate("/proyectos")}>
                  Ver Tareas
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default AgregarTareas;






