<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitaciones', function (Blueprint $table) {
            $table->id('id_invitacion'); // BIGINT por defecto, si quieres SERIAL usar unsignedInteger
            $table->string('token', 64)->unique();
            $table->string('rol', 50);

            // Claves foráneas con INT para coincidir con SERIAL
            $table->unsignedInteger('id_departamento');
            $table->unsignedInteger('creado_por');

            $table->foreign('id_departamento')
                  ->references('id_departamento')
                  ->on('c_departamento')
                  ->onDelete('cascade');

            $table->foreign('creado_por')
                  ->references('id_usuario')
                  ->on('usuario')
                  ->onDelete('cascade');

            $table->integer('max_usuarios')->default(1);
            $table->integer('usuarios_registrados')->default(0);
            $table->boolean('usado')->default(false);
            $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('expira_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitaciones');
    }
};

