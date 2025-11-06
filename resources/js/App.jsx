import React from 'react';
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProyectosProvider } from "./context/ProyectosContext";
import Contenedor from './Contenedor';
import Login from './login';
import CambiaContrasena from './CambiaContrasena';
import RegistroPaso1 from './RegistroPaso1';
import Home from './Home';
import Principal from './Principal';
import RegistroPaso2 from './RegistroPaso2';
import GenerarInvitacion from './GenerarIvitacion';
import NuevoProyecto from './NuevoProyecto';
import AgregarTareas from './AgregarTareas';
import Proyectos from './Proyectos';
import VerTareas from './Vertareas';
import VerTareasusuario from './Vertareasusuario';
import Usuario from './Usuario';
import TareasUsuario from './Tareasusuario';
import Reporte from './Reporte';
import Header from './Header';
import ModificarProyecto from './ModificarProyecto';
import ProyectosM from './ProyectosM';
import InterfazEliminar from "./InterfazEliminar";
import TareasenProceso from "./TareasenProceso";
import TareasPendientes from "./TareasPendientes";
import TareasCompletadas from "./TareasCompletadas";
import Backup from "./Backup";
import VerProyecto from "./VerProyecto";
import ModificarTareas from "./ModificarTareas";
import TareasPendientesJefe from "./TareasPendientesJefe";
import TareasCompletadasJefe from "./TareasCompletadasJefe";
import AgregarT from "./AgregarT";
import EditarTareas from "./EditarTareas";
import EliminarProyectos from "./EliminarProyectos";
import VerTareasPendientes from "./VerTareasPendientes";
import DesbloquearProyectos from "./DesbloquearProyectos";
import ReporteUsuario from "./ReporteUsuario";


function App() {
  return (
    <AuthProvider>
  <ProyectosProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Contenedor />} />
        <Route path="/CambiaContrasena" element={<CambiaContrasena />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Contenedor" element={<Contenedor />} />
        <Route path="/RegistroPaso2" element={<RegistroPaso2 />} />
        <Route path="/GenerarInvitacion" element={<GenerarInvitacion />} />
        <Route path="/RegistroPaso1/:token" element={<RegistroPaso1 />} />
        <Route path="/NuevoProyecto" element={<NuevoProyecto />} />
        <Route path="/AgregarTareas" element={<AgregarTareas />} />
        <Route path="/Proyectos" element={<Proyectos />} />
        <Route path="/Proyectos/:accion" element={<Proyectos />} />
        <Route path="/Vertareas" element={<VerTareas />} />
        <Route path="/Vertareasusuario" element={<VerTareasusuario />} />
        <Route path="/Vertareas/:accion" element={<VerTareas />} />
        <Route path="/Usuario" element={<Usuario />} />
        <Route path="/tareasusuario" element={<TareasUsuario />} />
        <Route path="/Reporte" element={<Reporte />} />
        <Route path="/Header" element={<Header />} />
        <Route path="/ProyectosM" element={<ProyectosM />} />
        <Route path="/InterfazEliminar" element={<InterfazEliminar />} />
 <Route path="/TareasenProceso" element={<TareasenProceso />} />
  <Route path="/TareasPendientes" element={<TareasPendientes />} />
   <Route path="/TareasCompletadas" element={<TareasCompletadas />} />
   <Route path="/Backup" element={<Backup />} />
   <Route path="/VerProyecto" element={<VerProyecto />} />
   <Route path="/modificarTareas" element={<ModificarTareas />} />
<Route path="/tareasPendientesJefe" element={<TareasPendientesJefe />} />
<Route path="/tareasCompletadasJefe" element={<TareasCompletadasJefe />} />
  <Route path="/ModificarProyecto" element={<ModificarProyecto />} />
    <Route path="/AgregarT" element={<AgregarT />} />
     <Route path="/EditarTareas/:id" element={<EditarTareas />} />
      <Route path="/EliminarProyectos" element={<EliminarProyectos />} />
      <Route path="/VerTareasPendientes" element={<VerTareasPendientes />} />
      <Route path="/DesbloquearProyectos" element={<DesbloquearProyectos />} />
      <Route path="/ReporteUsuario" element={<ReporteUsuario />} />

   
      </Routes>
    </Router>
  </ProyectosProvider>
</AuthProvider>

  );
}


export default App;

