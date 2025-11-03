<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;
use App\Models\Proyecto;
use App\Models\Usuario;

use App\Notifications\TareaAsignada;
use App\Models\Evidencia;
use DB;

class JefeController extends Controller
{
public function ProyectosDeUsuario(Request $request)
{
    try {
        $idUsuario = $request->query('usuario');

        if (!$idUsuario) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No se recibió el ID de usuario'
            ], 400);
        }

        // Solo tareas "Pendiente" o "En proceso" (mayúsculas/minúsculas)
        $tareas = DB::table('tareas as t')
            ->join('proyectos as p', 't.id_proyecto', '=', 'p.id_proyecto')
            ->select(
                't.id_tarea',
                't.id_usuario',
                't.t_nombre',
                't.t_estatus',
                't.tf_inicio',
                't.tf_fin',
                't.descripcion as descripcion_tarea',
                'p.id_proyecto',
                'p.p_nombre',
                'p.pf_fin',
                'p.p_estatus'
            )
            ->where('t.id_usuario', $idUsuario)
            ->whereIn(DB::raw('UPPER(t.t_estatus)'), ['PENDIENTE', 'EN PROCESO']) // FILTRO
            ->orderBy('p.p_nombre', 'asc')
            ->get();

        $proyectosMap = [];
        foreach ($tareas as $tarea) {
            $idProyecto = $tarea->id_proyecto;

            if (!isset($proyectosMap[$idProyecto])) {
                $proyectosMap[$idProyecto] = [
                    'id_proyecto' => $tarea->id_proyecto,
                    'p_nombre' => $tarea->p_nombre,
                    'pf_fin' => $tarea->pf_fin,
                    'p_estatus' => $tarea->p_estatus,
                    'tareas' => []
                ];
            }
            $proyectosMap[$idProyecto]['tareas'][] = [
                'id_tarea' => $tarea->id_tarea,
                't_nombre' => $tarea->t_nombre,
                't_estatus' => $tarea->t_estatus,
                'tf_inicio' => $tarea->tf_inicio,
                'tf_fin' => $tarea->tf_fin,
                'descripcion' => $tarea->descripcion_tarea
            ];
        }
        $proyectos = array_values($proyectosMap);

        return response()->json([
            'success' => true,
            'proyectos' => $proyectos
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}

//TAREAS PENDIENTES DE UN JEFE CON SU ID- INTERFAZ DE TAREAUSUARIO
public function obtenerTareasPendientes($idProyecto, $idUsuario)
{
    $tareasConEvidencias = Tarea::select('tareas.*')
        ->withCount(['evidencias' => function ($query) use ($idProyecto) {
            $query->where('id_proyecto', $idProyecto);
        }])
        ->where('id_proyecto', $idProyecto)
        ->where('id_usuario', $idUsuario)
        ->whereIn(DB::raw('LOWER(t_estatus)'), ['pendiente', 'en proceso']) // <-- Filtramos ambos estatus
        ->get();

    return response()->json([
        'success' => true,
        'tareas' => $tareasConEvidencias
    ]);
}
public function ObtenerTareasPendientesJefe($idUsuario)
{
    try {
        $tareas = DB::table('tareas')
            ->join('proyectos', 'tareas.id_proyecto', '=', 'proyectos.id_proyecto') // Unimos las tareas con los proyectos
            ->where('tareas.id_usuario', $idUsuario) // Filtramos por el ID de usuario
            ->whereRaw("UPPER(TRIM(tareas.t_estatus)) = ?", ['PENDIENTE']) // Filtramos solo tareas con estatus "PENDIENTE"
            ->select('tareas.*', 'proyectos.p_nombre') // Seleccionamos las tareas y el nombre del proyecto
            ->get();
        if ($tareas->isEmpty()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No se encontraron tareas pendientes para este usuario'
            ], 404);
        }
        $tareasAgrupadas = $tareas->groupBy('id_proyecto');
        $proyectosConTareas = $tareasAgrupadas->map(function ($tareasPorProyecto, $idProyecto) {
            return [
                'proyecto_id' => $idProyecto,
                'p_nombre' => $tareasPorProyecto->first()->p_nombre, 
                'tareas' => $tareasPorProyecto
            ];
        })->values();
        return response()->json([
            'success' => true,
            'tareas' => $proyectosConTareas
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
public function ObtenerTareasEnProcesoJefe($idUsuario)
{
    try {
        $tareas = DB::table('tareas')
            ->join('proyectos', 'tareas.id_proyecto', '=', 'proyectos.id_proyecto') // Unimos las tareas con los proyectos
            ->where('tareas.id_usuario', $idUsuario) // Filtramos por el ID de usuario
            ->whereRaw("UPPER(TRIM(tareas.t_estatus)) = ?", ['EN PROCESO']) // Filtramos solo tareas con estatus "EN PROCESO"
            ->select('tareas.*', 'proyectos.p_nombre') // Seleccionamos las tareas y el nombre del proyecto
            ->get();

        if ($tareas->isEmpty()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No se encontraron tareas en proceso para este usuario'
            ], 404);
        }

        $tareasAgrupadas = $tareas->groupBy('id_proyecto');
        $proyectosConTareas = $tareasAgrupadas->map(function ($tareasPorProyecto, $idProyecto) {
            return [
                'proyecto_id' => $idProyecto,
                'p_nombre' => $tareasPorProyecto->first()->p_nombre, 
                'tareas' => $tareasPorProyecto
            ];
        })->values();

        return response()->json([
            'success' => true,
            'tareas' => $proyectosConTareas
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
public function ObtenerTareasCompletadasUsuario($idUsuario)
{
    try {
        $tareas = DB::table('tareas')
            ->where('tareas.id_usuario', $idUsuario) // Filtramos por el ID de usuario
            ->whereRaw("UPPER(TRIM(tareas.t_estatus)) = ?", ['FINALIZADA']) // Filtramos solo tareas con estatus "FINALIZADO"
            ->select('tareas.*') 
            ->get();
        if ($tareas->isEmpty()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No se encontraron tareas completadas para este usuario'
            ], 404);
        }
        $tareasConProyectos = $tareas->map(function ($tarea) {
            $proyecto = DB::table('proyectos')
                ->where('id_proyecto', $tarea->id_proyecto)
                ->first();
            $tarea->p_nombre = $proyecto ? $proyecto->p_nombre : null;
            return $tarea;
        });
        return response()->json([
            'success' => true,
            'tareas' => $tareasConProyectos
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
//TAREAS POR DEPARTAMENTO PARA MODIFICAR
public function tareasPorDepartamento(Request $request)
{
    try {
        $idUsuario = $request->query('usuario');
        if (!$idUsuario) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No se recibió el ID de usuario'
            ], 400);
        }

        $usuario = DB::table('c_usuario')->where('id_usuario', $idUsuario)->first();
        if (!$usuario) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Usuario no encontrado'
            ], 404);
        }

        $idDepartamento = $usuario->id_departamento;
       $tareas = DB::table('tareas as t')
    ->join('proyectos as p', 't.id_proyecto', '=', 'p.id_proyecto')
    ->where('p.id_departamento', $idDepartamento)
    ->whereIn(DB::raw('LOWER(t.t_estatus)'), ['en proceso']) // solo tareas en proceso
    ->select(
        't.*',
        'p.p_nombre',
        'p.pf_inicio',
        'p.pf_fin',
        'p.p_estatus'
    )
    ->get();
        if ($tareas->isEmpty()) {
            return response()->json([
                'success' => false,
                'mensaje' => 'No hay tareas para este departamento'
            ]);
        }

        $proyectosConTareas = $tareas
            ->groupBy('id_proyecto')
            ->map(function ($tareasProyecto, $idProyecto) {
                $proyecto = $tareasProyecto->first();
                return [
                    'proyecto' => [
                        'id_proyecto' => $idProyecto,
                        'p_nombre' => $proyecto->p_nombre,
                        'pf_inicio' => $proyecto->pf_inicio,
                        'pf_fin' => $proyecto->pf_fin,
                        'p_estatus' => $proyecto->p_estatus,
                        'total_tareas' => $tareasProyecto->count(),
                    ],
                    'tareas' => $tareasProyecto
                ];
            })
            ->values(); 

        return response()->json([
            'success' => true,
            'proyectos' => $proyectosConTareas
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}


}