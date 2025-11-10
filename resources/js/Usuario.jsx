import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logo3 from "../imagenes/logo3.png";
import '../css/global.css';
import '../css/usuario.css';
import MenuDinamico from "../components/MenuDinamico";
import { FaFolderOpen, FaTasks, FaCalendarAlt,FaExclamationTriangle,FaSearch, FaBars} from 'react-icons/fa';

function Usuario() {
  const navigate = useNavigate(); 
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // === Colores según urgencia ===
  const getUrgencyColor = (fechaFin) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '#dc3545'; // Vencido 
    if (diffDays <= 3) return '#ffc107'; // Urgente
    if (diffDays <= 7) return '#fd7e14'; // Próximo
    return '#28a745'; // Normal
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // === Redirección a tareas ===
  const irATareas = (idProyecto, nombreProyecto) => {
    localStorage.setItem("id_proyecto", idProyecto);
    localStorage.setItem("nombre_proyecto", nombreProyecto);
    navigate("/tareasusuario");
  };

  // === Cargar proyectos ===
  useEffect(() => {
    const cargarProyectos = async () => {
      const token = localStorage.getItem("jwt_token");
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      const idUsuario = usuario.id_usuario;

      if (!token) {
        navigate("/Login", { replace: true });
        return;
      }

      if (!idUsuario) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/proyectos/jefe?usuario=${idUsuario}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          console.warn("Token inválido o expirado. Redirigiendo...");
          localStorage.clear();
          navigate("/Login", { replace: true });
          return;
        }

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();

        const proyectosConTareas = (data.proyectos || [])
          .map(p => ({
            ...p,
            tieneVencidos: p.tareas?.some(t => new Date(t.tf_fin) < new Date())
          }))
          .sort((a, b) => new Date(a.pf_fin) - new Date(b.pf_fin));

        setProyectos(proyectosConTareas);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, [navigate]);

  // === Filtrado optimizado con useMemo ===
  const filteredProyectos = useMemo(() => {
    return proyectos.filter(p =>
      p.p_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [proyectos, searchTerm]);

  return (
    <div className="main-layout">
      {/* ===== MENU LATERAL ===== */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <MenuDinamico
          collapsed={sidebarCollapsed}
          departamentoId={localStorage.getItem("last_depId")}
          departamentoNombre={localStorage.getItem("last_depNombre")}
          departamentoSlug={localStorage.getItem("last_depSlug")}
          activeRoute="tareas-enproceso"
        />
      </div>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-fondo">
          <img src={logo3} alt="Fondo" />
        </div>

        {/* ===== BARRA SUPERIOR ===== */}
        <div className="header-global">
          <div className="header-left" onClick={toggleSidebar}>
            <FaBars className="icono-hamburguesa-global" />
          </div>
          <div className="barra-center">
            <h2 className="titulo-barra-global">TAREAS POR REVISAR</h2>
          </div>
        </div>

        {/* ===== CONTENIDO ===== */}
        <div className="container my-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              <h1 className="form-titulo text-center mb-4">Proyectos asignados</h1>

              <div className="barra-busqueda-global-container mb-4">
                            <div className="barra-busqueda-global-wrapper">
                  <FaSearch className="barra-busqueda-global-icon" />
                  <input
                    type="text"
                    placeholder="Buscar proyectos..."
                    className="barra-busqueda-global-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loader-container">
                  <div className="loader-logo">
                    <img src={logo3} alt="Cargando proyectos" />
                  </div>
                  <div className="loader-texto">CARGANDO...</div>
                  <div className="loader-spinner"></div>
                </div>
              ) : filteredProyectos.length === 0 ? (
                <div className="empty-state">
                  <FaFolderOpen className="empty-icon" />
                  <h3 className="empty-title">
                    {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos activos'}
                  </h3>
                  <p className="empty-message">
                    {searchTerm 
                      ? 'Intenta con otros términos de búsqueda'
                      : 'Todos tus proyectos están completados o no tienes tareas pendientes o en proceso'}
                  </p>
                </div>
              ) : (
                <div className="proyectos-list">
                  {filteredProyectos.map(proyecto => (
                    <div className="proyecto-card-container" key={proyecto.id_proyecto}>
                      <div className="proyecto-card-usuario">
                        <div className="proyecto-header">
                          <div className="proyecto-icon-title">
                            <h3 className="proyecto-nombre">{proyecto.p_nombre}</h3>
                          </div>
                          {proyecto.tieneVencidos && (
                            <FaExclamationTriangle className="warning-icon" title="Tareas vencidas" />
                          )}
                        </div>

                        <div className="proyecto-stats">
                          <div className="stat-item">
                            <FaTasks className="stat-icon" />
                            <span className="stat-value">{proyecto.tareas.length}</span>
                            <span className="stat-label">Tareas pendientes</span>
                          </div>
                        </div>

                        <div className="proyecto-footer">
                          <div className="fecha-vencimiento">
                            <FaCalendarAlt className="calendar-icon" />
                            <span 
                              className="fecha-text"
                              style={{ color: getUrgencyColor(proyecto.pf_fin) }}
                            >
                              Vence: {formatFecha(proyecto.pf_fin)}
                            </span>
                          </div>
                          
                          <button 
                            className="btn-ver-tareas"
                            title={`Ver tareas del proyecto ${proyecto.p_nombre}`}
                            onClick={() => irATareas(proyecto.id_proyecto, proyecto.p_nombre)}
                          >
                            <FaTasks className="btn-icon" />
                            Ver Tareas
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuario;



















