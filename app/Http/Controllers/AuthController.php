<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $user = Usuario::where('correo', $request->correo)->first();

        if (!$user || !Hash::check($request->password, $user->contrasena)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        // Obtener datos de c_usuario
        $cUsuario = DB::table('c_usuario')->where('id_usuario', $user->id_usuario_login)->first();

        if (!$cUsuario) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'usuario' => [
                'id_usuario' => $cUsuario->id_usuario, // este es el que necesitas en React
                'nombre' => $cUsuario->u_nombre,
                'a_paterno' => $cUsuario->a_paterno,
                'a_materno' => $cUsuario->a_materno ?? null,
                'correo' => $user->correo,
                'rol' => $user->rol,
                'id_departamento' => $cUsuario->id_departamento
            ],
        ]);
    }

    public function usuario()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $cUsuario = DB::table('c_usuario')->where('id_usuario', $user->id_usuario_login)->first();

            return response()->json([
                'id_usuario' => $cUsuario->id_usuario,
                'nombre' => $cUsuario->u_nombre,
                'a_paterno' => $cUsuario->a_paterno,
                'a_materno' => $cUsuario->a_materno ?? null,
                'correo' => $user->correo,
                'rol' => $user->rol,
                'id_departamento' => $cUsuario->id_departamento
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }
    }
}

