<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BackupService
{
    public function crearCopiaTrimestral()
    {
        try {
            $fechaActual = now();
            $anio = $fechaActual->year;
            $mes = $fechaActual->month;

            // Determinar periodo
            if ($mes <= 3) $periodo = 'EneroMarzo';
            elseif ($mes <= 6) $periodo = 'AbrilJunio';
            elseif ($mes <= 9) $periodo = 'JulioSeptiembre';
            else $periodo = 'OctubreDiciembre';

            $nombreBD = "proyecto360_{$anio}_{$periodo}";

            // Parámetros de conexión
            $host = env('DB_HOST', '127.0.0.1');
            $port = env('DB_PORT', '5432');
            $user = env('DB_USERNAME', 'postgres');
            $password = env('DB_PASSWORD', '12345');
            $originalDB = env('DB_DATABASE', 'proyecto360');

            Log::info("=== INICIANDO BACKUP COMPLETO ===");

            // 1️⃣ Eliminar y crear nueva BD
            try {
                DB::statement("DROP DATABASE IF EXISTS \"$nombreBD\"");
                Log::info("BD anterior eliminada si existía");
            } catch (\Exception $e) {
                Log::warning("No se pudo eliminar BD: " . $e->getMessage());
            }

            DB::statement("CREATE DATABASE \"$nombreBD\"");
            Log::info("Nueva BD creada: $nombreBD");

            // 2️⃣ Crear archivo temporal de dump
            $tempFile = storage_path("app/backup.sql");

            // 3️⃣ Ejecutar pg_dump
            $dumpCommand = 'cmd /C "set PGPASSWORD=' . $password . ' && \"C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe\" -h ' . $host . ' -p ' . $port . ' -U ' . $user . ' -d ' . $originalDB . ' > \"' . $tempFile . '\" "';
            Log::info("Ejecutando pg_dump...");
            $outputDump = shell_exec($dumpCommand);
            Log::info("Output dump: " . $outputDump);

            // 4️⃣ Restaurar en la nueva BD
            $restoreCommand = 'cmd /C "set PGPASSWORD=' . $password . ' && \"C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe\" -h ' . $host . ' -p ' . $port . ' -U ' . $user . ' -d ' . $nombreBD . ' -f \"' . $tempFile . '\" "';
            Log::info("Restaurando dump en nueva BD...");
            $outputRestore = shell_exec($restoreCommand);
            Log::info("Output restore: " . $outputRestore);

            // 5️⃣ Conexión dinámica a la nueva BD
            config([
                'database.connections.pgsql_backup' => [
                    'driver'   => 'pgsql',
                    'host'     => $host,
                    'port'     => $port,
                    'database' => $nombreBD,
                    'username' => $user,
                    'password' => $password,
                    'charset'  => 'utf8',
                    'prefix'   => '',
                    'prefix_indexes' => true,
                    'schema'   => 'public',
                    'sslmode'  => 'prefer',
                ],
            ]);

            DB::purge('pgsql_backup');
            $conexionBackup = DB::connection('pgsql_backup');

            // 6️⃣ Verificar tablas y datos
            $tablas = $conexionBackup->select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
            $cantidadTablas = count($tablas);

            if ($cantidadTablas === 0) {
                throw new \Exception("No se copiaron tablas a la nueva BD.");
            }

            $tablasConDatos = [];
            foreach ($tablas as $tabla) {
                $nombreTabla = $tabla->tablename;
                $count = $conexionBackup->selectOne("SELECT COUNT(*) as total FROM \"$nombreTabla\"");
                $tablasConDatos[] = "$nombreTabla: " . $count->total . " registros";
            }

            Log::info("Copia exitosa. Tablas y registros: " . implode("; ", $tablasConDatos));

            return [
                "success" => true,
                "message" => "Copia COMPLETA exitosa: $nombreBD. Tablas: $cantidadTablas. " . implode("; ", $tablasConDatos)
            ];

        } catch (\Exception $e) {
            Log::error("Error en copia de seguridad: " . $e->getMessage());
            return [
                "success" => false,
                "message" => "Error al crear copia de seguridad: " . $e->getMessage()
            ];
        }
    }
}


