import React, { createContext, useState, useEffect } from "react";

export const ProyectosContext = createContext();

export const ProyectosProvider = ({ children }) => {
  // Al iniciar, intentar leer el proyecto del localStorage
  const [proyectoActual, setProyectoActual] = useState(() => {
    const proyecto = localStorage.getItem("proyectoActual");
    return proyecto ? JSON.parse(proyecto) : null;
  });

  // Guardar automáticamente en localStorage cuando cambia
  useEffect(() => {
    if (proyectoActual) {
      localStorage.setItem("proyectoActual", JSON.stringify(proyectoActual));
    } else {
      localStorage.removeItem("proyectoActual");
    }
  }, [proyectoActual]);

  return (
    <ProyectosContext.Provider value={{ proyectoActual, setProyectoActual }}>
      {children}
    </ProyectosContext.Provider>
  );
};

