<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;
use App\Models\Proyecto;
use App\Models\Usuario;
use App\Notifications\TareaAsignada;
use Illuminate\Support\Facades\Log;
use App\Models\Evidencia;
use DB;

class TareaController extends Controller
{
    // Crear tarea
    public function store(Request $request)
    {
        try {
            $tarea = Tarea::create([
                'id_proyecto' => $request->id_proyecto,
                'id_usuario'  => $request->id_usuario,
                't_nombre'    => $request->t_nombre,
                'descripcion' => $request->descripcion,
                'tf_inicio'   => $request->tf_inicio,
                'tf_fin'      => $request->tf_fin,
                't_estatus'   => 'Pendiente',
            ]);
            $usuario = Usuario::find($request->id_usuario);

            if ($usuario && $usuario->correo) {
                try {
                    $usuario->notify(new TareaAsignada($tarea));
                } catch (\Exception $e) {
                    Log::error("Error al enviar notificación: " . $e->getMessage());
                }
            } else {
                Log::warning("No se pudo enviar notificación. Usuario no encontrado o sin correo: ID " . $request->id_usuario);
            }

            return response()->json([
                'success' => true,
                'message' => 'Tarea creada correctamente',
                'tarea'   => $tarea
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

public function indexPorProyecto($id)
{
    $proyecto = Proyecto::find($id);

    if (!$proyecto) {
        return response()->json(['error' => 'Proyecto no encontrado'], 404);
    }

    $usuario = auth()->user();
    $id_usuario = request()->query('id_usuario', $usuario->id ?? null);

    $tareas = Tarea::where('id_proyecto', $id)
                   ->where('id_usuario', $id_usuario)
                   ->whereIn('t_estatus', ['Pendiente', 'En proceso'])
                   ->withCount('evidencias') 
                   ->get();

    return response()->json([
        'tareas' => $tareas
    ]);
}
// Obtener tareas por proyecto (para el jefe)
public function indexPorProyectoJefe($id)
{
    $proyecto = Proyecto::find($id);

    if (!$proyecto) {
        return response()->json(['error' => 'Proyecto no encontrado'], 404);
    }

    // El jefe debe ver TODAS las tareas del proyecto (sin filtrar por usuario)
    $tareas = Tarea::where('id_proyecto', $id)
                   ->whereIn('t_estatus', ['Pendiente', 'En proceso'])
                   ->with('usuario') // opcional, muestra a quién está asignada
                   ->withCount('evidencias')
                   ->get();

    return response()->json([
        'proyecto' => $proyecto,
        'tareas' => $tareas
    ]);
}
public function tareasPorDepartamento($id_departamento)
{
    $tareas = Tarea::whereHas('usuario', function($q) use ($id_departamento) {
        $q->where('id_departamento', $id_departamento);
    })
    ->whereIn('t_estatus', ['Pendiente', 'En proceso'])
    ->with('proyecto')
    ->withCount('evidencias')
    ->get()
    ->map(function($tarea) {
        $tarea->fechaVencimiento = $tarea->tf_fin ?? 'Sin fecha'; // nuevo campo
        return $tarea;
    });

    return response()->json([
        'tareas' => $tareas
    ]);
}


   public function show($id)
{
    // Trae tarea con usuario y departamento en una sola consulta
    $tarea = Tarea::with('usuario.departamento')->find($id);

    if (!$tarea) {
        return response()->json(['error' => 'Tarea no encontrada'], 404);
    }

    return response()->json($tarea);
}
public function showTarea($id_tarea)
{
    $tarea = Tarea::withCount('evidencias')
                  ->with('usuario') // opcional, si quieres mostrar quién tiene la tarea
                  ->find($id_tarea);

    if (!$tarea) {
        return response()->json(['error' => 'Tarea no encontrada'], 404);
    }

    return response()->json([
        'tarea' => $tarea
    ]);
}
 public function evidencias($id)
    {
        $evidencias = Evidencia::where('id_tarea', $id)->get();
        return response()->json($evidencias);
    }
public function tareasPendientes()
{
    $tareas = Tarea::where('t_estatus', 'Pendiente')
                   ->with('usuario')       
                   ->with('proyecto')      
                   ->withCount('evidencias')
                   ->get();

    return response()->json([
        'tareas' => $tareas
    ]);
}
//VERTAREAS-VERTAREAUSUARIO
public function tareasActivasPorProyecto($idProyecto)
{
    $proyecto = Proyecto::find($idProyecto);

    if (!$proyecto) {
        return response()->json(['error' => 'Proyecto no encontrado'], 404);
    }
    $tareas = Tarea::where('id_proyecto', $idProyecto)
               ->with('usuario') 
               ->withCount('evidencias')
               ->get()
               ->map(function($tarea) use ($proyecto) {
                   $tarea->proyectoNombre = $proyecto->p_nombre; 
                   return $tarea;
               });
    return response()->json([
        'tareas' => $tareas
    ]);
}

}



