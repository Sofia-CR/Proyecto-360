<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'c_departamento';
    protected $primaryKey = 'id_departamento';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'd_nombre'
    ];

    // Relación: un departamento tiene muchos usuarios
    public function usuarios()
    {
        return $this->hasMany(CUsuario::class, 'id_departamento', 'id_departamento');
    }
}
