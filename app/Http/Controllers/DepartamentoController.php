<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Area;
use Illuminate\Support\Facades\DB;

class DepartamentoController extends Controller
{
    public function index()
    {
        $areas = Area::with('departamentos')->get();
        return response()->json($areas, 200, [], JSON_UNESCAPED_UNICODE);
    }


    public function usuariosPorDepartamento(Departamento $departamento)
{
    return response()->json($departamento->usuarios);
}
}



