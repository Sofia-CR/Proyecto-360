<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tarea extends Model
{
    use HasFactory;

    protected $table = 'tareas';
    protected $primaryKey = 'id_tarea';
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_proyecto',
        't_nombre',
        'descripcion',
        'tf_inicio',
        'tf_fin',
        't_estatus',
        'tf_completada'
    ];

    protected $attributes = [
        't_estatus' => 'Pendiente',
    ];

    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'id_proyecto', 'id_proyecto');
    }
public function usuarioLogin()
{
    return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
}

    public function usuario()
    {
        return $this->belongsTo(CUsuario::class, 'id_usuario', 'id_usuario');
    }

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
    }

    // 🔹 Relación para contar evidencias
    public function evidencias()
    {
        return $this->hasMany(Evidencia::class, 'id_tarea', 'id_tarea');
    }
}


