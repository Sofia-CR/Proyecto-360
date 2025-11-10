import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import logo3 from "../imagenes/logo3.png";
import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaFilePdf, FaBars } from "react-icons/fa";
import ErrorMensaje from "../components/ErrorMensaje";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/formulario.css';
import "../css/global.css";
import '../css/reporte.css'; 
import PdfViewer from "./PdfViewer";
import MenuDinamico from "../components/MenuDinamico";

const CalendarButton = forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    className="btn-calendario w-100 d-flex align-items-center gap-2"
    onClick={onClick}
    ref={ref}
  >
    <FaCalendarAlt className={!value ? "text" : ""} /> 
    <span className={!value ? "text" : ""}>
      {value || "Seleccionar fecha"}
    </span>
  </button>
));

function ReporteUsuario() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [mostrarVisor, setMostrarVisor] = useState(false);
  const [errores, setErrores] = useState({});
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const validarFechas = () => {
    const nuevosErrores = {};
    if (!fechaInicio) nuevosErrores.fechaInicio = "Selecciona la fecha de inicio.";
    if (!fechaFin) nuevosErrores.fechaFin = "Selecciona la fecha de fin.";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

 const generarPDF = async () => {
  if (!validarFechas()) return;

  setCargando(true);
  setProgreso(0);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    console.warn("No autenticado. Redirigiendo al login...");
    navigate("/Login", { replace: true });
    return;
  }

  if (!usuario || !usuario.id_usuario) {
    console.log("No se pudo obtener la información de usuario necesaria.");
    setCargando(false);
    return;
  }

  let url = `/generar-pdf-completadas-jefe?id_usuario=${usuario.id_usuario}&tipo=completadas`;
  if (fechaInicio) url += `&fechaInicio=${fechaInicio.toISOString().split("T")[0]}`;
  if (fechaFin) url += `&fechaFin=${fechaFin.toISOString().split("T")[0]}`;

  const intervalo = setInterval(() => {
    setProgreso(prev => (prev >= 90 ? prev : prev + 10));
  }, 200);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/pdf",
      },
    });
    if (response.status === 401) {
      console.warn("Token inválido o expirado (401). Redirigiendo a login...");
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("usuario");
      navigate("/Login", { replace: true });
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error al generar PDF: ${response.status} - ${errorText}`);
      clearInterval(intervalo);
      setCargando(false);
      return;
    }

    const contentType = response.headers.get("Content-Type");
    const blob = await response.blob();
    if (!contentType || !contentType.includes("application/pdf")) {
      const blobText = await blob.text();
      console.log("No se recibió un PDF válido. Contenido del servidor:", blobText);
      clearInterval(intervalo);
      setCargando(false);
      return;
    }

    clearInterval(intervalo);
    setProgreso(100);

    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const nuevaUrl = URL.createObjectURL(blob);
    setPdfUrl(nuevaUrl);
    setMostrarVisor(true);

    setFechaInicio(null);
    setFechaFin(null);
    setTimeout(() => setProgreso(0), 500);

  } catch (error) {
    console.error("Error inesperado al generar el PDF:", error);
  } finally {
    clearInterval(intervalo);
    setCargando(false);
  }
};



  const cerrarVisor = () => {
    setMostrarVisor(false);
    setTimeout(() => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }, 1000);
  };

  return (
    <div className="main-layout">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <MenuDinamico
          collapsed={sidebarCollapsed}
          departamentoId={localStorage.getItem("last_depId")}
          departamentoNombre={localStorage.getItem("last_depNombre")}
          departamentoSlug={localStorage.getItem("last_depSlug")}
          activeRoute="reporte-usuario"
        />
      </div>

      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-fondo">
          <img src={logo3} alt="Fondo" />
        </div>

        <div className="header-global">
          <div className="header-left" onClick={toggleSidebar}>
            <FaBars className="icono-hamburguesa-global" />
          </div>
          <div className="barra-center">
            <h2 className="titulo-barra-global">GENERAR REPORTE</h2>
          </div>
        </div>

        <div className="container my-4">
          <h1 className="mb-4 form-titulo">Reporte de Mis Tareas Completadas</h1>
          <div className="generar-reportes mt-4 mx-auto p-3">
            <div className="fecha-selectores-container tareas-completadas d-flex justify-content-center gap-3 mb-3">
              <div className="fecha-item">
                <label className="form-label fw-bold">Fecha inicio:</label>
                <DatePicker
                  selected={fechaInicio}
                  onChange={(date) => {
                    setFechaInicio(date);
                    setErrores(prev => ({ ...prev, fechaInicio: undefined }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  locale={es}
                  maxDate={fechaFin || null}
                  customInput={<CalendarButton />}
                />
                <ErrorMensaje mensaje={errores.fechaInicio} />
              </div>
              <div className="fecha-item">
                <label className="form-label fw-bold">Fecha fin:</label>
                <DatePicker
                  selected={fechaFin}
                  onChange={(date) => {
                    setFechaFin(date);
                    setErrores(prev => ({ ...prev, fechaFin: undefined }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  locale={es}
                  minDate={fechaInicio || null}
                  customInput={<CalendarButton />}
                />
                <ErrorMensaje mensaje={errores.fechaFin} />
              </div>
            </div>

            <div className="d-flex flex-column align-items-center gap-2">
              {cargando && (
                <div className="progress-contenedor-mejorado w-100 mt-4">
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Generando PDF...</small>
                    <small className="text-muted fw-bold">{progreso}%</small>
                  </div>
                  <div className="progress progress-grueso">
                    <div
                      className="progress-bar progress-bar-mejorada"
                      role="progressbar"
                      style={{ width: `${progreso}%` }}
                      aria-valuenow={progreso}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button"
              className="boton-form mt-3"
              onClick={generarPDF}
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Generando PDF...
                </>
              ) : (
                <>
                  <FaFilePdf className="me-2" />
                  Generar PDF
                </>
              )}
            </button>
          </div>

          {mostrarVisor && pdfUrl && (
            <PdfViewer
              pdfUrl={pdfUrl}
              fileName={`Reporte_de_tareas_completadas.pdf`}
              onClose={cerrarVisor}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ReporteUsuario;
