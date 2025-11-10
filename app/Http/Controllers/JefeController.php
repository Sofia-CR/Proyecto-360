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
    //METODO QUE DEVUELVE LAS TAREAS PENDIENTES Y EN PROCESO DE UN USUARIO ESPECIFICO- SE USA EN LA INTERFAZ DE USUARIO.JSX
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
        $proyectos = Proyecto::whereHas('tareas', function($q) use ($idUsuario) {
            $q->where('id_usuario', $idUsuario)
              ->whereIn(DB::raw('UPPER(t_estatus)'), ['PENDIENTE', 'EN PROCESO']);
        })
        ->with(['tareas' => function($q) use ($idUsuario) {
            $q->where('id_usuario', $idUsuario)
              ->whereIn(DB::raw('UPPER(t_estatus)'), ['PENDIENTE', 'EN PROCESO']);
        }])
        ->orderBy('p_nombre', 'asc')
        ->get()
        ->map(function($proyecto) {
            return [
                'id_proyecto' => $proyecto->id_proyecto,
                'p_nombre' => $proyecto->p_nombre,
                'pf_fin' => $proyecto->pf_fin,
                'p_estatus' => $proyecto->p_estatus,
                'tareas' => $proyecto->tareas->map(function($tarea) {
                    return [
                        'id_tarea' => $tarea->id_tarea,
                        't_nombre' => $tarea->t_nombre,
                        't_estatus' => $tarea->t_estatus,
                        'tf_inicio' => $tarea->tf_inicio,
                        'tf_fin' => $tarea->tf_fin,
                        'descripcion' => $tarea->descripcion,
                    ];
                })->toArray()
            ];
        });

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

//METODO QUE DEVUELVE LAS TAREAS PENDIENTES DE UN USUARIO Y PROYECTO ESPECIFICO, SE UTILIZA EN LA INTERFAZ DE TAREA USUARIO.JSX
public function obtenerTareasPendientes($idProyecto, $idUsuario)
{
   $tareasConEvidencias = Tarea::withCount(['evidencias' => fn($q) => $q->where('id_proyecto', $idProyecto)])
    ->where([
        ['id_proyecto', $idProyecto],
        ['id_usuario', $idUsuario],
    ])
    ->whereIn('t_estatus', ['Pendiente', 'En proceso'])
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
public function tareasPorUsuario(Request $request)
{
    $usuarioId = $request->query('usuario');

    if (!$usuarioId) {
        return response()->json(['error' => 'Usuario no especificado'], 400);
    }

    // Conteos por estatus
    $conteos = \DB::table('tareas')
        ->selectRaw("
            COUNT(*) FILTER (WHERE LOWER(t_estatus) = 'finalizada') as completadas,
            COUNT(*) FILTER (WHERE LOWER(t_estatus) = 'pendiente') as pendientes,
            COUNT(*) FILTER (WHERE LOWER(t_estatus) = 'en proceso') as en_progreso,
            COUNT(*) as total
        ")
        ->where('id_usuario', $usuarioId)
        ->first();

    // Obtener tareas con info de proyecto
    $tareas = \DB::table('tareas')
        ->join('proyectos', 'tareas.id_proyecto', '=', 'proyectos.id_proyecto')
        ->select(
            'tareas.id_tarea',
            'tareas.id_proyecto',
            'proyectos.p_nombre as nombre_proyecto',
            'tareas.id_usuario',
            'tareas.t_nombre',
            'tareas.t_estatus',
            'tareas.tf_inicio',
            'tareas.tf_completada',
            'tareas.tf_fin',
            'tareas.descripcion'
        )
        ->where('tareas.id_usuario', $usuarioId)
        ->whereIn(DB::raw('LOWER(tareas.t_estatus)'), ['finalizada', 'pendiente', 'en proceso'])
        ->orderBy('tareas.tf_fin', 'asc')
        ->get();

    return response()->json([
        'tareas' => $tareas,
        'conteos' => $conteos
    ]);
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