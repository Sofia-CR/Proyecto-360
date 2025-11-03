import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import logo3 from "../imagenes/logo3.png";
import '../css/global.css';
import '../css/formulario.css';
import '../css/usuario.css';
import { 
  FaFolderOpen, 
  FaTasks, 
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSearch
} from 'react-icons/fa';

function Usuario() {
  const navigate = useNavigate(); 
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  useEffect(() => {
    const filtered = proyectos.filter(proyecto =>
      proyecto.p_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProyectos(filtered);
  }, [proyectos, searchTerm]);

  const irATareas = (idProyecto, nombreProyecto) => {
    localStorage.setItem("id_proyecto", idProyecto);
    localStorage.setItem("nombre_proyecto", nombreProyecto);
    navigate("/tareasusuario");
  };

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

  useEffect(() => {
    // Obtener token y verificar autenticación
    const token = localStorage.getItem("jwt_token");
    const usuarioStr = localStorage.getItem("usuario");
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    const idUsuario = usuario?.id_usuario;

    // Verificación de seguridad
    if (!token) {
      console.log("Token no encontrado. Redirigiendo a login.");
      navigate("/Login", { replace: true });
      return;
    }

    if (!idUsuario) {
      setLoading(false);
      return;
    }

    const loadingTimer = setTimeout(() => {
      fetch(`http://127.0.0.1:8000/api/proyectos/jefe?usuario=${idUsuario}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then(res => {
          // Manejo de token expirado/inválido
          if (res.status === 401) {
            console.warn("Token inválido o expirado (401). Redirigiendo a login.");
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("usuario");
            navigate("/Login", { replace: true });
            return;
          }

          if (!res.ok) {
            throw new Error(`Error en la solicitud: ${res.status}`);
          }

          return res.json();
        })
        .then(data => {
          console.log("Datos recibidos de la API:", data);
          const proyectosConTareas = (data.proyectos || [])
            .map(proyecto => ({
              ...proyecto,
              tieneVencidos: proyecto.tareas?.some(
                t => new Date(t.tf_fin) < new Date()
              )
            }))
            .sort((a, b) => new Date(a.pf_fin) - new Date(b.pf_fin));

          setProyectos(proyectosConTareas);
        })
        .catch(err => {
          console.error("Error al cargar proyectos:", err);
          if (err.message.includes('401')) {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("usuario");
            navigate("/Login");
          }
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(loadingTimer);
  }, [navigate]); 

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <div className="container my-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <h1 className="form-titulo text-center mb-4">Proyectos asignados</h1>
            <div className="search-container mb-4">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  className="search-input"
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
  );
}

export default Usuario;


















