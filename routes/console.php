<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
Schedule::command('tareas:revisar')
    ->dailyAt('08:00')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/tareas-command.log'));

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


