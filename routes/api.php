<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\InvitacionController;
use App\Http\Controllers\RegistroPaso1Controller;
use App\Http\Controllers\RegistroPaso2Controller;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NuevoProyectoController;
use App\Http\Controllers\ProyectoController;
use App\Http\Controllers\TareaController;
use App\Http\Controllers\CUsuarioController;
use App\Http\Controllers\EvidenciaController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\JefeController;
use App\Http\Controllers\TareasCompletadasController;
use App\Http\Controllers\TareasPController;
use App\Http\Controllers\ProyectoJefeController;
use Illuminate\Support\Facades\DB;
// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::get('/departamentos', [DepartamentoController::class, 'index']);
Route::post('/invitaciones/crear', [InvitacionController::class, 'crear']);
Route::post('/RegistroPaso1/invitado', [RegistroPaso1Controller::class, 'validarInvitacion']);
Route::post('/RegistroPaso2/invitado', [RegistroPaso2Controller::class, 'paso2']);
Route::get('/proyectos', [NuevoProyectoController::class, 'index']); 
Route::post('/proyectos', [NuevoProyectoController::class, 'store']);
Route::get('/CatalogoDepartamentos', [TareasCompletadasController::class, 'CatalogoDepartamentos']);
Route::post('/tareas', [TareaController::class, 'store']);
Route::get('/proyectos/jefe', [JefeController::class, 'ProyectosDeUsuario']);
Route::get('tareas/{idProyecto}/usuario/{idUsuario}', [JefeController::class, 'obtenerTareasPendientes']);
Route::get('tareasPendientes/jefe/{idUsuario}', [JefeController::class, 'ObtenerTareasPendientesJefe']);
Route::get('tareasCompletadas/jefe/{idUsuario}', [JefeController::class, 'ObtenerTareasCompletadasUsuario']);
Route::get('/tareas/departamento', [TareasCompletadasController::class, 'tareasEnProcesoDepartamento']);
Route::put('/tareas/{id}/completar', [TareasCompletadasController::class, 'completarTarea']);
Route::get('tareas-proyectos-jefe', [TareasPController::class, 'obtenerTareasProyectosJefe']);
Route::get('tareasCompletadas/jefe', [ProyectoController::class, 'tareasCompletadasJefe']);
Route::put('/proyectos/{id}/finalizar', [ProyectoJefeController::class, 'CambiarStatusProyecto']);
Route::get('/proyectos/completados', [TareasPController::class, 'obtenerProyectosCompletados']);
Route::put('/proyectos/{id}/cambiar-status', [ProyectoJefeController::class, 'CambiarStatusProyectoTerminado']);
Route::put('tareas/{idTarea}/cambiarstatus-tarea', [TareaController::class, 'CambiarStatusTareaFinalizada']);
Route::put('/tareas/{id}/cambiar-estatus-enproceso', [ProyectoJefeController::class, 'cambiarStatusTareaEnProceso']);
Route::get('generar-pdf-completadas-jefe', [ReporteUsuarioController::class, 'generarReporteCompletadas']);


//Route::get('/tareas/pendientes', [TareaController::class, 'tareasPendientes']);
Route::get('/proyectos/{id}/tareas', [TareaController::class, 'indexPorProyecto']);
Route::get('/proyectos/{id}/tareas-jefe', [TareaController::class, 'indexPorProyectoJefe']);
//Route::get('/tareas/departamento/{id_departamento}', [TareaController::class, 'tareasPorDepartamento']);
Route::post('/proyectos/eliminar-multiples', [ProyectoController::class, 'eliminarMultiples']);
Route::get('/departamentos/{id}/usuarios', [CUsuarioController::class, 'usuariosPorDepartamento']);
Route::get('/proyecto/{idProyecto}/tareas', [TareaController::class, 'indexPorProyecto']);
Route::put('/proyectos/{idProyecto}', [ProyectoController::class, 'update']);
Route::post('/evidencias', [EvidenciaController::class, 'subirEvidencia']);
Route::get('/reporte-vencimientos', [ReporteController::class, 'generarPDF']);
Route::get('/usuarios/{id}', [CUsuarioController::class, 'show']);
Route::get('/tarea/{id}/evidencias', [TareaController::class, 'evidencias']);
Route::get('/proyectos/{idProyecto}/tareas-activas', [TareaController::class, 'tareasActivasPorProyecto']);
Route::put('/proyectos/{id}/completar', [ProyectoController::class, 'completar']);
Route::post('/realizar-copia', [BackupController::class, 'crearCopiaApi']);
Route::get('/proyectos/usuario-tareas', [ProyectoController::class, 'proyectosUsuarioTareas']);
Route::get('/proyectos/usuario', [ProyectoController::class, 'proyectosPorUsuario']);
Route::get('/proyectos/{idProyecto}', [ProyectoController::class, 'show']);
Route::get('/tareasPorDepartamento', [JefeController::class, 'tareasPorDepartamento']);
//Route::get('proyectos/{idProyecto}/evidencias', [ProyectoController::class, 'evidenciasPorProyecto']);
Route::get('/tareaspendientesusuario', [ProyectoController::class, 'tareasPendientesUsuario']);

Route::get('/tareasPorProyecto', [ProyectoController::class, 'tareasPorProyecto']);


Route::get('/tareas/departamento', [TareaController::class, 'tareasEnProcesoDepartamento']);
Route::get('/proyectos/{id}/fechasProyecto', [ProyectoController::class, 'fechasProyecto']);
// Rutas protegidas por JWT
Route::middleware(['jwt.auth'])->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/usuario', [AuthController::class, 'usuario']);
    
    // Ruta fallback para login cuando no autenticado
Route::get('/login', function () {
    return response()->json(['error' => 'No autenticado'], 401);
})->name('login');
});
