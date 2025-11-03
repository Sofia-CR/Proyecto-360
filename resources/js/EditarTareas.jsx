import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import "../css/global.css";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";

registerLocale("es", es);

const CalendarButton = React.forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    className="btn btn-outline-secondary w-100 d-flex align-items-center gap-2"
    onClick={onClick}
    ref={ref}
  >
    <FaCalendarAlt /> {value || "Seleccionar fecha"}
  </button>
));

function EditarTareas() {
  const location = useLocation();
  const navigate = useNavigate();
  const tarea = location.state || {};
  const tareaId = tarea.id_tarea;

  // Estados
 
const [nombre, setNombre] = useState(tarea.t_nombre || "");
const [descripcion, setDescripcion] = useState(tarea.descripcion || tarea.t_descripcion || "");
const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(tarea.usuario?.id_usuario || "");
const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(tarea.usuario?.id_departamento || "");
const [fechaInicio, setFechaInicio] = useState(tarea.tf_inicio ? new Date(tarea.tf_inicio) : null);
const [fechaFin, setFechaFin] = useState(tarea.tf_fin ? new Date(tarea.tf_fin) : null);
  
// Si el usuario viene con la tarea, inicializamos el array para que aparezca en el select
const [usuarios, setUsuarios] = useState(
  tarea.usuario
    ? [{ 
        id_usuario: tarea.usuario.id_usuario,
        nombreCompleto: `${tarea.usuario.u_nombre} ${tarea.usuario.a_paterno} ${tarea.usuario.a_materno}`,
        id_departamento: tarea.usuario.id_departamento
      }]
    : []
);

// Departamento inicial
const [departamentos, setDepartamentos] = useState(
  tarea.usuario
    ? [{ 
        id_departamento: tarea.usuario.id_departamento, 
        d_nombre: tarea.usuario.departamentoNombre || "Desconocido" 
      }]
    : []
);

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchDepartamentos = async () => {
    try {
      const depRes = await axios.get("/api/departamentos");
      setDepartamentos(depRes.data);

      // Buscar el departamento de la tarea y ponerlo seleccionado
      if (tarea.usuario) {
        const dep = depRes.data.find(d => d.id_departamento === tarea.usuario.id_departamento);
        if (dep) setDepartamentoSeleccionado(dep.id_departamento);
      }

    } catch (err) {
      console.error(err);
    }
  };
  fetchDepartamentos();
}, []);

useEffect(() => {
  const fetchUsuarios = async () => {
    try {
      const res = await axios.get("/api/usuarios");
      const lista = res.data.map(u => ({
        ...u,
        nombreCompleto: `${u.u_nombre} ${u.a_paterno} ${u.a_materno}`
      }));
      setUsuarios(lista);

      // Seleccionar el usuario de la tarea si existe
      if (tarea.usuario) setUsuarioSeleccionado(tarea.usuario.id_usuario);
    } catch (err) {
      console.error(err);
    }
  };
  fetchUsuarios();
}, []);


useEffect(() => {
  if (usuarios.length === 0 || departamentos.length === 0) return;
  if (!tarea.usuario) return;

  setUsuarioSeleccionado(tarea.usuario.id_usuario);
  setDepartamentoSeleccionado(tarea.usuario.id_departamento);
}, [usuarios, departamentos, tarea.usuario]);


  // Función para modificar tarea
  const handleModificar = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const nuevosErrores = {};
    if (!nombre) nuevosErrores.nombre = "El nombre es obligatorio.";
    if (!descripcion) nuevosErrores.descripcion = "La descripción es obligatoria.";
    if (!fechaInicio) nuevosErrores.inicio = "Selecciona la fecha de inicio.";
    else if (fechaInicio < hoy) nuevosErrores.inicio = "La fecha de inicio no puede ser anterior a hoy.";
    if (!fechaFin) nuevosErrores.fin = "Selecciona la fecha de fin.";
    else if (fechaFin < fechaInicio) nuevosErrores.fin = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    if (!usuarioSeleccionado) nuevosErrores.usuario = "Selecciona un usuario.";

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    try {
      setLoading(true);
      const tareaActualizada = {
        t_nombre: nombre,
        t_descripcion: descripcion,
        tf_inicio: fechaInicio.toISOString().split("T")[0],
        tf_fin: fechaFin.toISOString().split("T")[0],
        id_usuario: parseInt(usuarioSeleccionado),
        id_departamento: parseInt(departamentoSeleccionado),
      };

      const res = await axios.put(`/api/tareas/${tareaId}`, tareaActualizada);
      if (res.data.success) navigate("/vertareas");
      else console.error("Error al modificar la tarea");
    } catch (err) {
      console.error("Error al modificar la tarea:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => navigate(-1);

  // JSX
  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <h1 className="text-center mb-4 form-titulo">Editar Tarea</h1>

            {/* Nombre */}
            <label className="form-label fw-bold">Nombre</label>
            <textarea
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="form-control mb-3"
              rows={1}
              placeholder="Nombre de la tarea"
            />
            {errores.nombre && <small className="text-danger">{errores.nombre}</small>}

            {/* Descripción */}
            <label className="form-label fw-bold">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="form-control mb-3"
              rows={2}
              placeholder="Descripción de la tarea"
            />
            {errores.descripcion && <small className="text-danger">{errores.descripcion}</small>}

            {/* Departamento */}
            <label className="form-label fw-bold">Departamento</label>
            <select
              value={departamentoSeleccionado || ""}
              onChange={(e) => setDepartamentoSeleccionado(parseInt(e.target.value))}
              className="form-select mb-3"
            >
              <option value="">Selecciona un departamento</option>
              {departamentos.map(d => (
  <option key={d.id_departamento} value={d.id_departamento}>
    {d.d_nombre}
  </option>
))}

            </select>

            {/* Usuario */}
            <label className="form-label fw-bold">Usuario</label>
            <select
  value={usuarioSeleccionado || ""}
  onChange={(e) => {
    const val = parseInt(e.target.value);
    setUsuarioSeleccionado(val);

    // Actualizar departamento automáticamente
    const usuario = usuarios.find(u => u.id_usuario === val);
    setDepartamentoSeleccionado(usuario?.id_departamento || "");
  }}
  className="form-select mb-3"
>
  <option value="">Selecciona un usuario</option>
  {usuarios.map(u => (
  <option key={u.id_usuario} value={u.id_usuario}>
    {u.nombreCompleto}
  </option>
))}

</select>

            {errores.usuario && <small className="text-danger">{errores.usuario}</small>}

            {/* Fechas */}
            <div className="row mb-3">
              <div className="col-12 col-md-6 mb-3 d-flex flex-column">
                <label className="form-label fw-bold mb-1">Fecha de inicio</label>
                <DatePicker
                  selected={fechaInicio}
                  onChange={(d) => setFechaInicio(d)}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  locale="es"
                  minDate={new Date()}
                  customInput={<CalendarButton />}
                />
                {errores.inicio && <small className="text-danger mt-1">{errores.inicio}</small>}
              </div>
              <div className="col-12 col-md-6 mb-3 d-flex flex-column">
                <label className="form-label fw-bold mb-1">Fecha de fin</label>
                <DatePicker
                  selected={fechaFin}
                  onChange={(d) => setFechaFin(d)}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  locale="es"
                  minDate={fechaInicio || new Date()}
                  customInput={<CalendarButton />}
                />
                {errores.fin && <small className="text-danger mt-1">{errores.fin}</small>}
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex flex-column flex-md-row gap-2 justify-content-center">
              <button type="button" className="btn-form w-100 w-md-auto" onClick={handleCancelar}>
                Cancelar
              </button>
              <button type="button" className="btn-form w-100 w-md-auto" onClick={handleModificar} disabled={loading}>
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditarTareas;











