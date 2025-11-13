import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logo3 from "../imagenes/logo3.png";
import '../css/global.css';
import '../css/ListaDeProyectos.css';
import MenuDinamico from "../components/MenuDinamico";
import Layout from "../components/Layout";
import { FaFolderOpen, FaTasks, FaCalendarAlt, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

function ListaDeProyectos() {
  const navigate = useNavigate(); 
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fecha');
  
  const getUrgencyInfo = (fechaFin) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // poner hoy a 00:00

  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0); // poner fecha fin a 00:00

  const diffTime = fin - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { color: '#dc3545', label: 'Vencido', days: diffDays };
  if (diffDays <= 3) return { color: '#ffc107', label: 'Urgente', days: diffDays };
  if (diffDays <= 7) return { color: '#fd7e14', label: 'Próximo', days: diffDays };
  return { color: '#28a745', label: 'En plazo', days: diffDays };
};


  const contarTareas = (tareas) => {
    const hoy = new Date();
    return {
      total: tareas?.length || 0,
      vencidas: tareas?.filter(t => new Date(t.tf_fin) < hoy).length || 0,
      pendientes: tareas?.filter(t => t.estado === 'pendiente').length || 0,
      enProceso: tareas?.filter(t => t.estado === 'en_proceso').length || 0
    };
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const irATareas = (idProyecto, nombreProyecto) => {
    localStorage.setItem("id_proyecto", idProyecto);
    localStorage.setItem("nombre_proyecto", nombreProyecto);
    navigate("/tareasusuario");
  };

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

  const filteredAndSortedProyectos = useMemo(() => {
    let filtered = proyectos.filter(p =>
      p.p_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.p_nombre.localeCompare(b.p_nombre);
        case 'tareas':
          return (b.tareas?.length || 0) - (a.tareas?.length || 0);
        case 'urgentes':
          const aUrgent = getUrgencyInfo(a.pf_fin).days <= 3;
          const bUrgent = getUrgencyInfo(b.pf_fin).days <= 3;
          return (bUrgent ? 1 : 0) - (aUrgent ? 1 : 0);
        default:
          return new Date(a.pf_fin) - new Date(b.pf_fin);
      }
    });
  }, [proyectos, searchTerm, sortBy]);

  const renderProyectoCard = (proyecto) => {
    const urgencia = getUrgencyInfo(proyecto.pf_fin);
    const tareasInfo = contarTareas(proyecto.tareas);

    return (
      <div className="ldp-proyecto-card-container" key={proyecto.id_proyecto}>
        <div className="ldp-proyecto-card-usuario">
          {/* Header */}
          <div className="ldp-proyecto-header">
            <div className="ldp-proyecto-icon-title">
              <h3 className="ldp-proyecto-nombre">{proyecto.p_nombre}</h3>
            </div>
            <div className="ldp-header-badges">
              <span 
                className="ldp-urgency-badge"
                style={{ backgroundColor: urgencia.color }}
              >
                {urgencia.label}
              </span>
              {proyecto.tieneVencidos && (
                <FaExclamationTriangle 
                  className="ldp-warning-icon" 
                  title={`${tareasInfo.vencidas} tareas vencidas`}
                />
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="ldp-proyecto-stats">
            <div className="ldp-stats-grid">
              <div className="ldp-stat-item">
                <FaTasks className="ldp-stat-icon" />
                <div>
                  <span className="ldp-stat-value">{tareasInfo.total}</span>
                  <span className="ldp-stat-label">Total Tareas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="ldp-proyecto-footer">
            <div className="ldp-fecha-info">
              <FaCalendarAlt className="ldp-calendar-icon" />
              <div>
                <span 
                  className="ldp-fecha-text"
                  style={{ color: urgencia.color }}
                >
                  Vence: {formatFecha(proyecto.pf_fin)}
                </span>
                <span
                  className="ldp-dias-restantes"
                  style={{ color: urgencia.color }}
                >
                  {urgencia.days < 0
                    ? `${Math.abs(urgencia.days)} días de retraso`
                    : urgencia.days === 0
                      ? 'Vence hoy'
                      : `${urgencia.days} días restantes`
                  }
                </span>
              </div>
            </div>

            <button 
              className="ldp-btn-ver-tareas"
              title={`Ver ${tareasInfo.total} tareas del proyecto ${proyecto.p_nombre}`}
              onClick={() => irATareas(proyecto.id_proyecto, proyecto.p_nombre)}
            >
              <FaTasks className="ldp-btn-icon" />
              Ver Tareas
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout
      titulo="MIS PROYECTOS"
      sidebar={<MenuDinamico activeRoute="gestion-proyectosusuario" />}
    >
      <div className="ldp-container">
        <h1 className="ldp-main-title">Proyectos Asignados</h1>
        
        {/* Barra de búsqueda */}
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

        {/* Contenido principal */}
        <div className="ldp-content">
          {loading ? (
            <div className="loader-container">
              <div className="loader-logo">
                <img src={logo3} alt="Cargando proyectos" />
              </div>
              <div className="loader-text">CARGANDO PROYECTOS ASIGNADOS...</div>
              <div className="loader-spinner"></div>
            </div>
          ) : filteredAndSortedProyectos.length === 0 ? (
            <div className="ldp-empty">
              <FaFolderOpen className="ldp-empty-icon" />
              <h3 className="ldp-empty-title">
                {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos activos'}
              </h3>
              <p className="ldp-empty-message">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Todos tus proyectos están completados o no tienes tareas pendientes'
                }
              </p>
            </div>
          ) : (
            <div className="ldp-proyectos-list">
              {filteredAndSortedProyectos.map(renderProyectoCard)}
              
              <div className="ldp-summary">
                <span>
                  Mostrando {filteredAndSortedProyectos.length} de {proyectos.length} proyectos
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ListaDeProyectos;


















