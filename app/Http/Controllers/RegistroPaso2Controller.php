<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invitacion;
use App\Models\Usuario;
use App\Models\CUsuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RegistroPaso2Controller extends Controller
{
    public function paso2(Request $request)
    {
        // 1️⃣ Validación de campos
        $request->validate([
            'correo' => 'required|email',
            'password' => 'required|string|min:6',
            'token_invitacion' => 'required|string',
            'token_verificacion' => 'required|string|size:8',
            'nombre' => 'required|string',
            'apellidoPaterno' => 'required|string',
            'apellidoMaterno' => 'nullable|string',
            'telefono' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // 2️⃣ Verificar invitación
            $invitacion = Invitacion::where('token', $request->token_invitacion)
                ->lockForUpdate()
                ->first();

            if (!$invitacion) {
                return response()->json([
                    'ok' => false,
                    'error' => 'invitacion_invalida',
                    'message' => 'Invitación no válida.'
                ], 400);
            }

            if ($invitacion->usuarios_registrados >= $invitacion->max_usuarios) {
                return response()->json([
                    'ok' => false,
                    'error' => 'invitacion_completa',
                    'message' => 'La invitación ya alcanzó el límite de usuarios.'
                ], 400);
            }

            // 3️⃣ Verificar token de 8 dígitos
            $tokenValido = DB::table('password_reset_tokens')
                ->where('correo', $request->correo)
                ->where('token', $request->token_verificacion)
                ->where('usado', false)
                ->first();

            if (!$tokenValido) {
                return response()->json([
                    'ok' => false,
                    'error' => 'token_incorrecto',
                    'message' => 'Token de verificación inválido.'
                ], 400);
            }

            // 4️⃣ Crear registro en c_usuario y obtener el ID generado
            $cUsuario = CUsuario::create([
                'id_departamento' => $invitacion->id_departamento,
                'u_nombre' => $request->nombre,
                'a_paterno' => $request->apellidoPaterno,
                'a_materno' => $request->apellidoMaterno ?? '',
                'telefono' => $request->telefono ?? '',
            ]);

            // 5️⃣ Crear registro en usuario usando el id generado de c_usuario
            Usuario::create([
                'id_usuario_login' => $cUsuario->id_usuario,
                'rol' => $invitacion->rol,
                'correo' => $request->correo,
                'contrasena' => Hash::make($request->password),
            ]);

            // 6️⃣ Marcar token de verificación como usado
            DB::table('password_reset_tokens')
                ->where('id', $tokenValido->id)
                ->update(['usado' => true]);

            // 7️⃣ Actualizar contador de la invitación
            $invitacion->increment('usuarios_registrados');
            if ($invitacion->usuarios_registrados >= $invitacion->max_usuarios) {
                $invitacion->usado = true;
            }
            $invitacion->save();

            DB::commit();

            return response()->json([
                'ok' => true,
                'message' => 'Registro completado correctamente.'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'ok' => false,
                'error' => 'exception',
                'message' => 'Error al registrar: ' . $e->getMessage()
            ], 500);
        }
    }
}
