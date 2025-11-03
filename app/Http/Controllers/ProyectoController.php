<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proyecto;
use Illuminate\Support\Facades\DB; 


class ProyectoController extends Controller
{
    //MOSTRAR PROYECTOS CON EL ESTATUS ENVIADO COMO PARAMETRO
    public function index()
{
    try {
        $proyectos = Proyecto::withCount(['tareas' => function($q) {
            $q->whereIn('t_estatus', ['Pendiente', 'En proceso']);
        }])->get();

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

//PROYECTOS QUE TIENEN ASIGNADAS TAREAS DE UNA USUARIO ESPECIFICO
    public function proyectosUsuarioTareas(Request $request)
{
    $idUsuario = $request->query('usuario');

    // Validación: que exista y sea un número entero
    if (!$idUsuario || !ctype_digit($idUsuario)) {
        return response()->json([
            'success' => false,
            'mensaje' => 'ID de usuario inválido'
        ], 400);
    }

    $idUsuario = (int) $idUsuario; // Convertimos a entero por seguridad

    $proyectos = Proyecto::with(['tareas' => function($q) use ($idUsuario) {
        $q->where('id_usuario', $idUsuario);
    }])->whereHas('tareas', function($q) use ($idUsuario) {
        $q->where('id_usuario', $idUsuario);
    })->get();

    $tareasConProyecto = [];

    foreach ($proyectos as $proyecto) {
        foreach ($proyecto->tareas as $tarea) {
            $tareasConProyecto[] = [
                'id' => $tarea->id,
                't_nombre' => $tarea->t_nombre,
                't_estatus' => $tarea->t_estatus,
                'tf_fin' => $tarea->tf_fin,
                'proyecto' => [
                    'id_proyecto' => $proyecto->id_proyecto,
                    'proyectoNombre' => $proyecto->p_nombre,
                    'p_estatus' => $proyecto->p_estatus,
                    'pf_fin' => $proyecto->pf_fin,
                ]
            ];
        }
    }

    return response()->json([
        'success' => true,
        'tareas' => $tareasConProyecto
    ]);
}

public function eliminarMultiples(Request $request)
{
    $ids = $request->input('ids'); // Array de IDs de proyectos

    if (!$ids || !is_array($ids)) {
        return response()->json([
            'success' => false,
            'mensaje' => 'No se recibieron IDs válidos'
        ], 400);
    }

    try {
        
        Proyecto::whereIn('id_proyecto', $ids)->delete();

        return response()->json([
            'success' => true,
            'mensaje' => 'Proyectos y tareas eliminados correctamente'
        ]);
    } catch (\Illuminate\Database\QueryException $e) {
        // Capturamos errores específicos de base de datos
        \Log::error('Error al eliminar proyectos (QueryException): ' . $e->getMessage());

        $mensaje = 'Error de base de datos al eliminar proyectos';

        // Detectamos violación de clave foránea (PostgreSQL: 23503)
        if (str_contains($e->getMessage(), '23503')) {
            $mensaje = 'No se pueden eliminar proyectos que tienen tareas asociadas';
        }

        return response()->json([
            'success' => false,
            'mensaje' => $mensaje,
            'error' => app()->environment('local') ? $e->getMessage() : null
        ], 500);
    } catch (\Exception $e) {
        // Otros errores generales
        \Log::error('Error al eliminar proyectos: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'mensaje' => 'Ocurrió un error al eliminar los proyectos',
            'error' => app()->environment('local') ? $e->getMessage() : null
        ], 500);
    }
}
// OBTENER UN PROYECTO PARA MODIFICAR CON ID
public function show($idProyecto)
{
    try {
        $proyecto = Proyecto::find($idProyecto);

        if (!$proyecto) {
            return response()->json([
                'success' => false,
                'message' => 'Proyecto no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'proyecto' => $proyecto
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
//MODIFICAR PROYECTO
public function update(Request $request, $idProyecto)
{
    try {
        $proyecto = Proyecto::find($idProyecto);

        if (!$proyecto) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Proyecto no encontrado'
            ], 404);
        }

        // Obtenemos las fechas del request y las convertimos a formato adecuado
        $pf_inicio = $request->input('pf_inicio', $proyecto->pf_inicio);
        $pf_fin = $request->input('pf_fin', $proyecto->pf_fin);

        // Si las fechas se envían como strings, las convertimos a instancias de Carbon
        if ($pf_inicio) {
            $pf_inicio = \Carbon\Carbon::createFromFormat('Y-m-d', $pf_inicio)->startOfDay();
        }
        if ($pf_fin) {
            $pf_fin = \Carbon\Carbon::createFromFormat('Y-m-d', $pf_fin)->endOfDay();
        }

        // Asignamos los valores a los atributos del proyecto
        $proyecto->p_nombre = $request->input('p_nombre', $proyecto->p_nombre);
        $proyecto->descripcion = $request->input('descripcion', $proyecto->descripcion);
        $proyecto->pf_inicio = $pf_inicio;
        $proyecto->pf_fin = $pf_fin;

        // Guardamos el proyecto con las fechas correctamente formateadas
        $proyecto->save();

        return response()->json([
            'success' => true,
            'proyecto' => $proyecto
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}

//CAMBIAR ESTATUS DE PROYECTO
public function completar($idProyecto)
{
    try {
        $proyecto = Proyecto::find($idProyecto);

        if (!$proyecto) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Proyecto no encontrado'
            ], 404);
        }

        $proyecto->p_estatus = 'Completado';
        $proyecto->save();

        return response()->json([
            'success' => true,
            'proyecto' => $proyecto
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
//INFORMACIÓN DE PROYECTOS-PROYECTOS VER, TAREAS COMPLETADAS-NOOOO
public function proyectosPorUsuario(Request $request)
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

       $proyectos = DB::table('proyectos as p')
    ->leftJoin('tareas as t', 'p.id_proyecto', '=', 't.id_proyecto')
    ->select(
        'p.*',
        DB::raw('COUNT(t.id_tarea) as total_tareas'),
        DB::raw("SUM(CASE WHEN t.t_estatus = 'En proceso' THEN 1 ELSE 0 END) as tareas_en_proceso"),
        DB::raw("SUM(CASE WHEN t.t_estatus = 'Completado' THEN 1 ELSE 0 END) as tareas_completadas")
    )
    ->where('p.id_departamento', $idDepartamento)
    ->where('p.p_estatus', 'EN PROCESO')
    ->groupBy('p.id_proyecto')
    ->get();
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
//EVIDENCIAS DE UN PROYECTO-NOOOO
public function evidenciasPorProyecto($idProyecto)
{
    try {
        $evidencias = DB::table('evidencias as e')
            ->join('tareas as t', 'e.id_tarea', '=', 't.id_tarea')
            ->where('t.id_proyecto', $idProyecto)
            ->select('e.*', 't.t_nombre')
            ->get();

        return response()->json($evidencias);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
//TAREAS PENDIENTES-INTERFAZ TAREAS PENDIENTES
public function tareasPendientesUsuario(Request $request)
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
        $proyectos = DB::table('proyectos as p')
            ->join('tareas as t', 'p.id_proyecto', '=', 't.id_proyecto')
            ->select(
                'p.*',
                DB::raw('COUNT(t.id_tarea) as total_tareas')
            )
            ->where('p.id_departamento', $idDepartamento)
            ->where('p.p_estatus', 'EN PROCESO')
            ->whereRaw("UPPER(TRIM(t.t_estatus)) = ?", ['PENDIENTE'])
            ->groupBy('p.id_proyecto')
            ->get();

        $proyectosConTareas = [];
        foreach ($proyectos as $proyecto) {
            $tareas = DB::table('tareas')
                ->where('id_proyecto', $proyecto->id_proyecto)
                ->whereRaw("UPPER(TRIM(t_estatus)) = ?", ['PENDIENTE'])
                ->get();

            $proyectosConTareas[] = [
                'proyecto' => $proyecto,
                'tareas' => $tareas
            ];
        }

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


//TAREAS COMPLETADAS
public function tareasCompletadasJefe(Request $request)
{
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
        ->whereRaw("UPPER(TRIM(t.t_estatus)) = ?", ['FINALIZADA'])
        ->select('t.*', 'p.p_nombre', 'p.pf_inicio', 'p.pf_fin', 'p.p_estatus')
        ->get();

    if ($tareas->isEmpty()) {
        return response()->json([
            'success' => false,
            'mensaje' => 'No hay tareas finalizadas para este departamento'
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
}

//MODIFICAR TAREAS
public function tareasPorProyecto(Request $request)
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
//OBTENER FECHAS PARA CALENDARIO
public function fechasProyecto($id_proyecto)
    {
        $proyecto = Proyecto::find($id_proyecto);
        if (!$proyecto) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Proyecto no encontrado'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'pf_inicio' => $proyecto->pf_inicio,
            'pf_fin' => $proyecto->pf_fin
        ]);
    }
}



