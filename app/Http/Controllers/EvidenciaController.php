<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evidencia;
use App\Models\Tarea;

class EvidenciaController extends Controller
{
// Obtener evidencias de un proyecto específico
public function evidenciasProyecto($idProyecto)
{
    // Obtener todas las tareas del proyecto
    $tareas = Tarea::where('id_proyecto', $idProyecto)->pluck('id_tarea');

    // Obtener todas las evidencias de esas tareas
    $evidencias = Evidencia::whereIn('id_tarea', $tareas)->get();

    return response()->json([
        'success' => true,
        'evidencias' => $evidencias
    ]);
}

}

