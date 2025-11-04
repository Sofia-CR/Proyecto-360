<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proyecto;

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
            'mensaje' => 'Proyecto marcado como finalizado',
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

}
