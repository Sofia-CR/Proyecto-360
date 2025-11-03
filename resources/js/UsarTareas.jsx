import { useState, useEffect } from "react";

export const useTareas = (accion) => {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        if (accion === "ver") {
          const usuario = JSON.parse(localStorage.getItem("usuario"));
          if (!usuario?.id_departamento) return;

          const res = await fetch(`http://127.0.0.1:8000/api/tareas/departamento/${usuario.id_departamento}`);
          const data = await res.json();
          setTareas((data.tareas || []).map(t => ({
            ...t,
            selected: false,
            proyectoNombre: t.proyecto?.p_nombre || "Proyecto desconocido",
            id: t.id_tarea,
          })));
        } else {
          const idProyecto = localStorage.getItem("id_proyecto");
          if (!idProyecto) return;

          const res = await fetch(`http://127.0.0.1:8000/api/proyectos/${idProyecto}/tareas-jefe`);
          const data = await res.json();
          setTareas((data.tareas || []).map(t => ({
            ...t,
            selected: false,
            proyectoNombre: data.proyecto?.p_nombre || "Proyecto desconocido",
            id: t.id_tarea,
          })));
        }
      } catch (error) {
        console.error("Error al cargar tareas:", error);
      }
    };

    fetchTareas();
  }, [accion]);

  const toggleSeleccion = (idTarea) => {
    setTareas(prev => prev.map(t => t.id === idTarea ? { ...t, selected: !t.selected } : t));
  };

  return { tareas, setTareas, toggleSeleccion };
};
