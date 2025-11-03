<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;
use App\Models\Tarea;
use Illuminate\Support\Facades\DB;

class TareasCompletadasController extends Controller
{
    public function CatalogoDepartamentos()
    {
        $departamentos = DB::table('c_departamento')->get();
        return response()->json($departamentos);
    }
public function tareasEnProcesoDepartamento(Request $request)
{
    try {
        // Obtener usuario
        $usuario = DB::table('c_usuario')
            ->where('id_usuario', $request->query('usuario'))
            ->first();

        if (!$usuario) {
            return response()->json(['success' => false, 'mensaje' => 'Usuario no encontrado'], 404);
        }

        $idDepartamento = $usuario->id_departamento;

        // Obtener proyectos con tareas en proceso y sus evidencias
        $proyectos = \App\Models\Proyecto::where('id_departamento', $idDepartamento)
            ->whereHas('tareas', function($q) {
                $q->where('t_estatus', 'En proceso');
            })
            ->with(['tareas' => function($q) {
                $q->where('t_estatus', 'En proceso') // solo tareas en proceso
                  ->with('evidencias:id_evidencia,id_tarea,id_proyecto,id_departamento,id_usuario,ruta_archivo,fecha');
            }])
            ->get()
            ->map(function($proyecto) {
                // Solo tareas en proceso
                $tareasEnProceso = $proyecto->tareas;

                // Contadores
                $proyecto->total_tareas = $tareasEnProceso->count();
                $proyecto->tareas_completadas = $tareasEnProceso->where('t_estatus', 'En proceso')->count();

                // Evidencias solo de tareas en proceso
                $proyecto->evidencias = $tareasEnProceso->flatMap->evidencias;

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
 public function completarTarea($id)
    {
        try {
            \Log::info('Solicitud recibida para completar tarea:', ['id' => $id]);
            
            // Buscar la tarea
            $tarea = Tarea::find($id);
            
            if (!$tarea) {
                \Log::warning('Tarea no encontrada:', ['id' => $id]);
                return response()->json(['success' => false, 'mensaje' => 'Tarea no encontrada'], 404);
            }

            \Log::info('Tarea encontrada:', ['tarea' => $tarea]);

            // Actualizar el estado
            $tarea->update([
                't_estatus' => 'Finalizada',
                'tf_completada' => now()
            ]);

            \Log::info('Tarea actualizada exitosamente');

            return response()->json([
                'success' => true,
                'mensaje' => 'Tarea marcada como Finalizada',
                'tarea' => $tarea
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en completarTarea:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}