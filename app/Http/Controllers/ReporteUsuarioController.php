<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tarea;
use App\Models\CUsuario;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Mpdf\Mpdf;

class ReporteUsuarioController extends Controller
{
    public function generarReporteCompletadas(Request $request)
    {
        $idUsuario = $request->query('id_usuario');
        $inicio = $request->query('fechaInicio');
        $fin = $request->query('fechaFin');
        date_default_timezone_set('America/Mexico_City');   
        $hoy = Carbon::now()->format('d/m/Y');
        $hora = Carbon::now()->format('H:i:s');
        $usuarioData = CUsuario::with('departamento')->find($idUsuario);
        if (!$usuarioData) {
            return response()->json(['error' => 'Usuario no encontrado.'], 404);
        }

        $usuario = [
            'nombre' => $usuarioData->u_nombre ?? '',
            'a_paterno' => $usuarioData->a_paterno ?? '',
            'a_materno' => $usuarioData->a_materno ?? '',
            'departamento' => $usuarioData->departamento->d_nombre ?? 'N/A',
        ];
        $tareas = Tarea::where('id_usuario', $idUsuario)
            ->whereBetween('tf_completada', [$inicio, $fin])
            ->get();
        $tipo = 'completadas-jefe';
      $html = view('pdf.ReportesJefe', [
            'tareas' => $tareas,
            'usuario' => $usuario,
            'inicio' => $inicio,
            'fin' => $fin,
            'tipo' => $tipo,
            'hoy' => $hoy,
            'hora' => $hora
        ])->render();
        $mpdf = new Mpdf();
        $mpdf->showImageErrors = true;
        $mpdf->SetWatermarkImage(public_path('imagenes/logo1.png'), 0.1, [150, 200], 'C');
        $mpdf->showWatermarkImage = true;
        $cssPath = resource_path('css/pdf.css');
        if (file_exists($cssPath)) {
            $css = file_get_contents($cssPath);
            $mpdf->WriteHTML($css, \Mpdf\HTMLParserMode::HEADER_CSS);
        }
        $mpdf->WriteHTML($html, \Mpdf\HTMLParserMode::HTML_BODY);
        return $mpdf->Output('Reporte_de_tareas_completadas.pdf', 'I');
    }
}
