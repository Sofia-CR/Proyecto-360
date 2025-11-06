import React, { useState, useEffect, useMemo } from "react";
import {
  FaFolder,
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChartBar,
  FaDoorOpen,
  FaChevronRight,
  FaChevronDown,
  FaTasks,
  FaCheckCircle,
  FaHourglassHalf ,
  FaSpinner,
  FaToggleOn,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import logo3 from "../imagenes/logo3.png";
import "../css/global1.css";

function Header({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed") === "true";
    setCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nuevoEstado = !collapsed;
    setCollapsed(nuevoEstado);
    localStorage.setItem("sidebar-collapsed", nuevoEstado);
    if (nuevoEstado) setOpenSubmenu(null); // Cierra submenus al colapsar
  };

  const toggleSubmenu = (label) => {
    if (openSubmenu === label) setOpenSubmenu(null);
    else setOpenSubmenu(label);
  };

  const handleNavigation = (path) => {
    if (path === "logout") {
      logout();
      navigate("/");
    } else {
      navigate(path);
    }
  };
  const menuOptions = useMemo(() => {
    if (usuario?.rol === "Jefe") {
      return [
        { label: "NUEVO PROYECTO", path: "/Nuevoproyecto", icon: <FaPlus /> },
        {
          label: "PROYECTOS",
          icon: <FaFolder />,
          subMenu: [
            { label: "Ver Proyectos", path: "/VerProyecto", icon: <FaEye /> },
            { label: "Modificar Proyectos", path: "/ProyectosM", icon: <FaEdit /> },
             { label: "Cambiar estatus del proyecto", path: "/DesbloquearProyectos", icon: <FaToggleOn /> },
            { label: "Eliminar Proyectos", path: "/EliminarProyectos", icon: <FaTrash /> },
          ],
        },
        {
          label: "TAREAS",
          icon: <FaTasks />,
          subMenu: [
              { label: "Tareas en proceso", path: "/TareasenProceso", icon: <FaSpinner /> },
             { label: "Tareas pendientes", path: "/TareasPendientes", icon: <FaHourglassHalf /> },
              { label: "Tareas completadas", path: "/TareasCompletadasJefe", icon: <FaCheckCircle /> },
             { label: "Agregar Tareas", path: "/AgregarT", icon: <FaPlus /> },
            { label: "Modificar tarea", path: "/ModificarTareas", icon: <FaEdit /> },
            { label: "Eliminar tarea", path: "/InterfazEliminar", icon: <FaTrash /> },
          ],
        },
        { label: "REPORTES", path: "/reporte", icon: <FaChartBar /> },
        { label: "CERRAR SESIÓN", path: "logout", icon: <FaDoorOpen /> },
      ];
    } else {
      
      return [
        { label: "TAREAS PENDIENTES", path: "/TareasPendientesJefe", icon: <FaHourglassHalf /> },
         { label: "Tareas completadas", path: "/TareasCompletadasJefe", icon: <FaCheckCircle /> },
        { label: "REPORTES", path: "/ReporteUsuario", icon: <FaChartBar /> },
        { label: "CERRAR SESIÓN", path: "logout", icon: <FaDoorOpen /> },
      ];
    }
  }, [usuario]);

  return (
    <div className="app-container">
      <header className="header-global">
        <div className="header-left" onClick={toggleSidebar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="icono-casa-global"
          >
            <path d="M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8z" />
          </svg>
        </div>
        <div className="barra-center">
          <span className="titulo-barra-global">GESTIÓN DE PROYECTOS</span>
        </div>
      </header>

      <div className="main-layout">
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <ul>
            {menuOptions.map((item) => (
              <li key={item.label}>
                <div
                  className="menu-item"
                  onClick={() =>
                    item.subMenu
                      ? !collapsed && toggleSubmenu(item.label)
                      : handleNavigation(item.path)
                  }
                >
                  <span className="icon">{item.icon}</span>
                  {!collapsed && <span className="label">{item.label}</span>}
                  {!collapsed && item.subMenu && (
                    <span className="submenu-arrow">
                      {openSubmenu === item.label ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </div>

                {item.subMenu && !collapsed && openSubmenu === item.label && (
                  <ul className="submenu">
                    {item.subMenu.map((sub) => (
                      <li key={sub.label} onClick={() => handleNavigation(sub.path)}>
                        <span className="icon">{sub.icon}</span>
                        <span className="label">{sub.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className={`main-content ${collapsed ? "collapsed" : ""}`}>
          {children}
        </main>
      </div>

      <img src={logo3} alt="Logo central" className="logo-fondo-global" />
    </div>
  );
}

export default Header;













