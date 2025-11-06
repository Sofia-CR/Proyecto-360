import { useState, useRef } from "react";
import React, { forwardRef } from "react";
import Header from "./Header";
import DatePicker from "react-datepicker";
import { FaCalendarAlt, FaFilePdf } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/reporte.css';
import '../css/formulario.css'; 
import PdfViewer from "./PdfViewer";
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

    const usuario = JSON.parse(localStorage.getItem('usuario'));

   let url = `/generar-pdf-completadas-jefe`;
    if (usuario && usuario.id_usuario) {
      url += `?id_usuario=${usuario.id_usuario}`;
    } else {
        alert("No se pudo obtener la información de usuario necesaria.");
        setCargando(false);
        return;
    }
    
    if (fechaInicio) url += `&fechaInicio=${fechaInicio.toISOString().split('T')[0]}`;
    if (fechaFin) url += `&fechaFin=${fechaFin.toISOString().split('T')[0]}`;
    
    console.log("URL de solicitud:", url);
    
    const intervalo = setInterval(() => {
        setProgreso(prev => {
            if (prev >= 90) {
                clearInterval(intervalo);
                return prev;
            }
            return prev + 10;
        });
    }, 200);

    try {
        const response = await fetch(url);
        console.log("Respuesta del Servidor:");
        console.log("Status:", response.status);
        console.log("Content-Type:", response.headers.get('Content-Type'));
        console.log("Content-Length:", response.headers.get('Content-Length'));
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al generar el PDF: ${response.status} - ${errorText}`);
        }

        const blob = await response.blob();
        
        clearInterval(intervalo);
        setProgreso(100);
        
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }
        
        const nuevaUrl = URL.createObjectURL(blob);
        
        setPdfUrl(nuevaUrl);
        setMostrarVisor(true);
        
        setFechaInicio(null);
        setFechaFin(null);
        
        setTimeout(() => setProgreso(0), 500);
        
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert(`Error al generar el PDF: ${error.message}`);
    } finally {
        clearInterval(intervalo);
        setCargando(false);
    }
  };
  
  const cerrarVisor = () => {
    setMostrarVisor(false);
    setTimeout(() => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }, 1000);
  };

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <h1 className="mb-4 form-titulo">Reporte de Mis Tareas Completadas</h1>
      
      <div className="generar-reportes mt-4 mx-auto p-3">
        <div className="reportes-container">
          <div className={`fecha-selectores-container tareas-completadas`}>
            <div className="d-flex flex-md-row justify-content-center gap-3 mb-3">
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
                {errores.fechaInicio && <small className="text-danger mt-1">{errores.fechaInicio}</small>}
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
                {errores.fechaFin && <small className="text-danger mt-1">{errores.fechaFin}</small>}
              </div>
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
        </div>
        
        <div className="mt-3">
          <button 
            type="button"
            className="boton-form"
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
      </div>
      
      {mostrarVisor && pdfUrl && (
        <PdfViewer
          pdfUrl={pdfUrl}
          fileName={`Reporte_de_tareas_completadas.pdf`}
          onClose={cerrarVisor}
        />
      )}
    </div>
  );
}

export default ReporteUsuario;