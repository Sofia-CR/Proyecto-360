<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PasswordResetToken extends Model
{
    protected $table = 'password_reset_tokens';
    public $timestamps = false; // Ya tienes creado_en y expira_en
    protected $fillable = ['correo', 'token', 'usado', 'creado_en', 'expira_en'];

    // Función opcional para verificar expiración
    public function isExpired()
    {
        return $this->expira_en && Carbon::parse($this->expira_en)->lt(Carbon::now());
    }
}
