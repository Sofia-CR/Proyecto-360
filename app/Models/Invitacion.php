<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitacion extends Model
{
    protected $table = 'invitaciones';

    protected $fillable = [
        'token',
        'rol',
        'id_departamento',
        'creado_por',
        'expira_en',
        'max_usuarios',
        'usuarios_registrados',
        'usado'
    ];

    public $timestamps = false;
    protected $primaryKey = 'id_invitacion';
    public $incrementing = true;
    protected $keyType = 'int';

    public function departamento()
{
    return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
}

public function creador()
{
    return $this->belongsTo(Usuario::class, 'creado_por', 'id_usuario');
}

}

