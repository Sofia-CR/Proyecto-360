<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proyecto;
use App\Models\Tarea;

class ProyectoJefeController extends Controller
{
    // Cambiar estatus de un proyecto a Finalizado
    public function CambiarStatusProyecto($id)
    {
        $proyecto = Proyecto::find($id);

        if (!$proyecto) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Proyecto no encontrado'
            ], 404);
        }

        $proyecto->p_estatus = "Finalizado";
        $proyecto->save();

        return response()->json([
            'success' => true,
            'mensaje' => 'Proyecto marcado como finalizado',
            'proyecto' => $proyecto
        ]);
    }


    public function CambiarStatusProyectoTerminado($id)
    {
        $proyecto = Proyecto::find($id);

        if (!$proyecto) {
            return response()->json([
                'success' => false,
                'mensaje' => 'Proyecto no encontrado'
            ], 404);
        }

        $proyecto->p_estatus = "En proceso";
        $proyecto->save();

        return response()->json([
            'success' => true,
            'mensaje' => 'Proyecto marcado como ',
            'proyecto' => $proyecto
        ]);
    }

    public function CambiarStatusTareaFinalizada($idTarea)
{
    $tarea = Tarea::find($idTarea);

    if (!$tarea) {
        return response()->json([
            'success' => false,
            'mensaje' => 'Tarea no encontrada'
        ], 404);
    }

    $tarea->t_estatus = "Finalizada";
    $tarea->save();

    return response()->json([
        'success' => true,
        'mensaje' => 'Tarea marcada como finalizada',
        'tarea' => $tarea
    ]);
}
public function cambiarStatusTareaEnProceso($idTarea)
{
    \Log::info("Intentando actualizar tarea", ['id_tarea' => $idTarea]);

    $tarea = Tarea::find($idTarea);

    if (!$tarea) {
        \Log::warning("Tarea no encontrada", ['id_tarea' => $idTarea]);
        return response()->json([
            'success' => false,
            'mensaje' => 'Tarea no encontrada'
        ], 404);
    }

    try {
        $tarea->t_estatus = "En proceso";
        $tarea->save();

        \Log::info("Tarea actualizada correctamente", ['id_tarea' => $idTarea, 'estatus' => $tarea->t_estatus]);

        return response()->json([
            'success' => true,
            'mensaje' => 'Tarea marcada como en proceso',
            'tarea' => $tarea
        ]);
    } catch (\Exception $e) {
        \Log::error("Error al actualizar tarea", [
            'id_tarea' => $idTarea,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'success' => false,
            'mensaje' => 'Ocurrió un error al actualizar la tarea'
        ], 500);
    }
}



}
