<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    protected $backupService;

    public function __construct(BackupService $backupService)
    {
        $this->backupService = $backupService;
    }

    /**
     * Endpoint API para crear copia trimestral.
     * URL sugerida: /api/realizar-copia
     */
    public function crearCopiaApi()
    {
        $resultado = $this->backupService->crearCopiaTrimestral();

        if ($resultado['success']) {
            return response()->json([
                "success" => true,
                "message" => $resultado['message']
            ], 200);
        } else {
            return response()->json([
                "success" => false,
                "message" => $resultado['message']
            ], 500);
        }
    }
}


