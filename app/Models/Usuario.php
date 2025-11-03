<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable implements JWTSubject
{
    use Notifiable; 

    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario'; 
    public $timestamps = false;

    protected $fillable = [
        'id_usuario_login',
        'rol',
        'correo',
        'contrasena',
    ];

    protected $hidden = [
        'contrasena', // para que no se muestre al retornar JSON
    ];

    // JWT
    public function getJWTIdentifier() {
        return $this->getKey();
    }

    public function getJWTCustomClaims() {
        return [];
    }

    // Relación hacia c_usuario para obtener datos del usuario
    public function cusuario()
    {
        return $this->hasOne(CUsuario::class, 'id_usuario', 'id_usuario_login');
    }

    // Para notificaciones por mail usar el campo 'correo'
    public function routeNotificationForMail($notification)
    {
        return $this->correo;
    }
}

