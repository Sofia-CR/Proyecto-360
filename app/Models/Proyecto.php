<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    protected $table = 'proyectos';

    protected $primaryKey = 'id_proyecto'; // clave primaria real

    protected $fillable = [
        'id_departamento',
        'p_nombre',
        'descripcion',
        'pf_inicio',
        'pf_fin',
        'p_estatus'
    ];

    public $timestamps = false; // desactiva created_at y updated_at

    // Relación con tareas
    public function tareas()
    {
        return $this->hasMany(\App\Models\Tarea::class, 'id_proyecto', 'id_proyecto');
    }

    public function departamento()
{
    return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
}

}

