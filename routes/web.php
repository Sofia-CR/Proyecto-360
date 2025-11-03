<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReporteController;

Route::get('/generar-pdf', [ReporteController::class, 'generarPDF']);

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
