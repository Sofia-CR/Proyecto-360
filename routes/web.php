<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\ReporteUsuarioController;

Route::get('/generar-pdf', [ReporteController::class, 'generarPDF']);
Route::get('/generar-pdf-completadas-jefe', [ReporteUsuarioController::class, 'generarReporteCompletadas']);

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
