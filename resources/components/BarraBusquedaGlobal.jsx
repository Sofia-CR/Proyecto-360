import "../css/Formulario.css"; 
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi";

const BarraBusquedaGlobal = ({ datos = [], onResultados }) => {
  const [busqueda, setBusqueda] = useState("");

  // Filtra los datos si se pasan y ejecuta callback opcional
  const resultadosFiltrados = datos.filter(item =>
    item.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (onResultados) onResultados(resultadosFiltrados);

  return (
    <div className="barra-busqueda-global-container mb-4">
      <div className="barra-busqueda-global-wrapper">
        <FaSearch className="barra-busqueda-global-icon" />
        <input
          type="text"
          placeholder="Buscar tareas o proyectos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="barra-busqueda-global-input"
        />
        {busqueda && (
          <button
            className="buscador-clear-global"
            onClick={() => setBusqueda("")}
          >
            <FiX />
          </button>
        )}
      </div>

      {busqueda && (
        <div className="buscador-resultados-global">
          {resultadosFiltrados.length} resultado(s) para "{busqueda}"
        </div>
      )}
    </div>
  );
};

export default BarraBusquedaGlobal;

