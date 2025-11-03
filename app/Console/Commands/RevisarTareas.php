<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tarea;
use Carbon\Carbon;

class RevisarTareas extends Command
{
    protected $signature = 'tareas:revisar';
    protected $description = 'Revisar tareas vencidas y enviar correos';

    public function handle()
    {
        $ayer = Carbon::yesterday();

        $tareasVencidas = Tarea::where('tf_fin', '<=', $ayer)
    ->whereRaw('LOWER(t_estatus) = ?', ['pendiente'])
    ->get();

       foreach ($tareasVencidas as $tarea) {
    $usuario = $tarea->usuarioLogin; // aquí obtienes el Usuario para el correo
    if ($usuario && $usuario->correo) {
        $usuario->notify(new \App\Notifications\TareaVencida($tarea));
        $this->info("Correo enviado a: {$usuario->correo}");
    } else {
        $this->warn("Tarea {$tarea->id_tarea} no tiene usuario o correo válido.");
    }
}
        $this->info('Proceso terminado.');
    }
}

