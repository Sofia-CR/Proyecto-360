<?php

namespace App\Http\Controllers;



class ReporteUsuarioController extends Controller
{
    public function generarReporteCompletadas(Request $request)
    {
   
        $usuario = [];
        if ($usuarioData) {
            $usuario = [
                 'nombre' => $usuarioData->u_nombre ?? '',
                 'a_paterno' => $usuarioData->u_a_paterno ?? '',
                 'a_materno' => $usuarioData->u_a_materno ?? '',
                 'departamento' => $usuarioData->departamento_nombre ?? 'N/A'
            ];
        } else {
             return response()->json(['error' => 'Usuario no encontrado.'], 404);
        }

        dd([
            'id_usuario_recibido' => $idUsuario,
            'fecha_inicio' => $inicio,
            'fecha_fin' => $fin,
            'tareas_encontradas' => $tareas->count(),
            'tareas_data_first' => $tareas->first() ? $tareas->first()->toArray() : 'No hay tareas',
            'usuario_data' => $usuario,
        ]);

        $html = view('pdf.Reportes', [ 
             // ...
        ])->render();

    }
}