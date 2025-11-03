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
            ->whereHas('tareas', function($q) {
                $q->where('t_estatus', 'ILIKE', 'en proceso');
            })
            ->with(['tareas' => function($q) {
                $q->where('t_estatus', 'ILIKE', 'en proceso')
                  ->with('evidencias');
            }])
            ->get()
            ->map(function($proyecto) {
                $tareasEnProceso = $proyecto->tareas;
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