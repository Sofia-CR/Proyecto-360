<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CUsuario;

class CUsuarioController extends Controller
{
    public function usuariosPorDepartamento($id_departamento)
{
    $usuarios = \DB::table('c_usuario')
        ->join('usuario', 'c_usuario.id_usuario', '=', 'usuario.id_usuario')
        ->where('c_usuario.id_departamento', $id_departamento)
        ->where('usuario.rol', 'Usuario')
        ->select(
    'usuario.id_usuario', 
    'c_usuario.u_nombre as nombre',
    'c_usuario.a_paterno as apaterno',
    'c_usuario.a_materno as amaterno',
    'usuario.rol'
)
        ->get();

    return response()->json($usuarios);
}

    public function show($id) {
    $usuario = CUsuario::find($id);
    if (!$usuario) return response()->json(['error' => 'Usuario no encontrado'], 404);
    return response()->json($usuario);
}

}
