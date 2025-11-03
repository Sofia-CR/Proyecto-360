<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable; 
use Illuminate\Notifications\Notifiable;

class CUsuario extends Model
{
     use Notifiable;
    protected $table = 'c_usuario';
    protected $primaryKey = 'id_usuario';
    public $timestamps = false; 

    protected $fillable = [
        'id_departamento',
        'u_nombre',
        'a_paterno',
        'a_materno',
        'telefono',
    ];

    public function departamento()
{
    return $this->belongsTo(Departamento::class, 'id_departamento', 'id_departamento');
}

}

