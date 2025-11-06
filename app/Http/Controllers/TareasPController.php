<?php
namespace App\Http\Controllers;
use App\Models\Tarea;
use App\Models\Proyecto;
use App\Models\Usuario;
use App\Models\CUsuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TareasPController extends Controller
{
public function obtenerTareasProyectosJefe(Request $request)
{
    try {
       $usuario = DB::table('c_usuario')
            ->where('id_usuario', $request->query('usuario'))
            ->first();

        if (!$usuario) {
            return response()->json(['success' => false, 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $idDepartamento = $usuario->id_departamento;

        $proyectos = \App\Models\Proyecto::where('id_departamento', $idDepartamento)
            ->where('p_estatus', 'ILIKE', 'EN PROCESO')
            ->whereHas('tareas', function($q) {
                // Solo proyectos que tengan al menos una tarea EN PROCESO o FINALIZADA
                $q->whereIn(DB::raw('LOWER(t_estatus)'), ['en proceso', 'finalizada']);
            })
            ->with(['tareas' => function($q) {
                // Trae todas las tareas EN PROCESO o FINALIZADA con sus evidencias
                $q->whereIn(DB::raw('LOWER(t_estatus)'), ['en proceso', 'finalizada'])
                    ->with('evidencias');
            }])
            ->get()
            ->map(function($proyecto) {
                // 1. Total de tareas (independiente de estatus)
                $proyecto->total_tareas = \App\Models\Tarea::where('id_proyecto', $proyecto->id_proyecto)->count();

                // 2. Tareas completadas (Progreso validado por el jefe)
                $proyecto->tareas_completadas = \App\Models\Tarea::where('id_proyecto', $proyecto->id_proyecto)
                    ->where('t_estatus', 'ILIKE', 'Finalizada')
                    ->count();

                // 3. ¡NUEVA MÉTRICA! Tareas listas para revisión (Estatus 'En Proceso' Y tienen evidencia)
                $proyecto->tareas_a_revisar = \App\Models\Tarea::where('id_proyecto', $proyecto->id_proyecto)
                    ->where('t_estatus', 'ILIKE', 'En Proceso') // Tareas en estatus 'En Proceso'
                    ->whereHas('evidencias') // ¡Que además tengan evidencias subidas!
                    ->count();
                
                return $proyecto;
            });

        return response()->json([
            'success' => true,
            'proyectos' => $proyectos
        ]);

    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}
public function obtenerProyectosCompletados(Request $request)
{
    try {
        // 👇 Obtienes el usuario directamente desde la query (temporal)
        $usuarioId = $request->query('usuario_id'); 
        $usuario = DB::table('c_usuario')->where('id_usuario', $usuarioId)->first();

        if (!$usuario) {
            return response()->json(['success' => false, 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $idDepartamento = $usuario->id_departamento;

        $proyectos = \App\Models\Proyecto::where('id_departamento', $idDepartamento)
            ->where('p_estatus', 'ILIKE', 'Finalizado') 
            ->whereHas('tareas', function($q) {
                $q->whereIn(DB::raw('LOWER(t_estatus)'), ['finalizada']);
            })
            ->with(['tareas' => function($q) {
                $q->whereIn(DB::raw('LOWER(t_estatus)'), ['finalizada'])
                  ->with('evidencias');
            }])
            ->get()
            ->map(function($proyecto) {
                $proyecto->total_tareas = \App\Models\Tarea::where('id_proyecto', $proyecto->id_proyecto)->count();
                $proyecto->tareas_completadas = \App\Models\Tarea::where('id_proyecto', $proyecto->id_proyecto)
                    ->whereHas('evidencias')
                    ->count();
                return $proyecto;
            });

        return response()->json([
            'success' => true,
            'proyectos' => $proyectos
        ]);

    } catch (\Exception $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
}


}