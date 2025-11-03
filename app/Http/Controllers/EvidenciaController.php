<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Evidencia;

class EvidenciaController extends Controller
{
    public function subirEvidencia(Request $request)
{
    \Log::info('Recibido request:', $request->all());
    if ($request->hasFile('archivo')) {
        \Log::info('Archivo recibido', ['nombre' => $request->file('archivo')->getClientOriginalName()]);
    } else {
        \Log::warning('No se recibió archivo');
    }
    try {
        $request->validate([
            'id_proyecto' => 'required|integer',
            'id_tarea' => 'required|integer',
            'id_departamento' => 'required|integer',
            'id_usuario' => 'required|integer',
            'ruta_archivo' => 'required|file|mimes:jpg,jpeg,png,pdf,docx|max:5120'
        ]);

        $rutaArchivo = $request->file('ruta_archivo')->store('evidencias', 'public');

        $evidencia = Evidencia::create([
            'id_proyecto' => $request->id_proyecto,
            'id_tarea' => $request->id_tarea,
            'id_departamento' => $request->id_departamento,
            'id_usuario' => $request->id_usuario,
            'ruta_archivo' => $rutaArchivo,
            'fecha' => now(),
        ]);
        $tarea = \App\Models\Tarea::find($request->id_tarea);
        if ($tarea) {
            $tarea->t_estatus = 'En proceso';
            $tarea->save();
        }

        return response()->json([
            'success' => true,
            'evidencia' => $evidencia,
            'message' => 'Evidencia subida y tarea completada'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error al subir evidencia: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
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

