// BarraBusquedaGlobal.js
import React from "react";
import { FaSearch } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import "../css/Formulario.css"; // Asegúrate que la ruta es correcta

// Este componente ahora es 100% reutilizable y no sabe nada
// sobre "proyectos" o "tareas". Solo maneja el input.

const BarraBusquedaGlobal = ({ valor, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="barra-busqueda-global-container mb-4">
      <div className="barra-busqueda-global-wrapper">
        <FaSearch className="barra-busqueda-global-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="barra-busqueda-global-input"
        />
        {valor && (
          <button
            className="buscador-clear-global"
            onClick={() => onChange("")}
          >
            <FiX />
          </button>
        )}
      </div>
      {/* HEMOS QUITADO ESTO:
        {valor && (
          <div className="buscador-resultados-global">
            Buscando: "{valor}"
          </div>
        )}
        Porque esta lógica le pertenece al componente padre.
      */}
    </div>
  );
};

export default BarraBusquedaGlobal;



