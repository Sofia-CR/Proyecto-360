<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Proyecto;
use Illuminate\Support\Facades\DB; 


class NuevoProyectoController extends Controller
{
    //CREAR PROYECTOS-NUEVOPROYECTO-NuevoProyecto.jsx
    public function store(Request $request)
    {
        try {
            $proyecto = Proyecto::create($request->all());
            return response()->json([
                'success' => true,
                'proyecto' => $proyecto
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //MOSTRAR PROYECTOS CON EL ESTATUS ENVIADO COMO PARAMETRO
    public function index()
{
    try {
        $proyectos = Proyecto::withCount(['tareas' => function($q) {
            $q->whereIn('t_estatus', ['Pendiente', 'En proceso']);
        }])->get();

        return response()->json([
            'success' => true,
            'proyectos' => $proyectos
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
}