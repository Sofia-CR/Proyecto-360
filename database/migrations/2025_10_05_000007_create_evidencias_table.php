<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidencias', function (Blueprint $table) {
            $table->increments('id_evidencia'); 

            $table->integer('id_proyecto')->unsigned();
            $table->foreign('id_proyecto')
                ->references('id_proyecto')
                ->on('proyectos')
                 ->onDelete('cascade');
            $table->integer('id_tarea')->unsigned();
            $table->foreign('id_tarea')
                ->references('id_tarea')
                ->on('tareas')
                ->onDelete('cascade');
            $table->integer('id_departamento')->unsigned();
            $table->foreign('id_departamento')
                ->references('id_departamento')
                ->on('c_departamento')
                ->onDelete('cascade');
            $table->integer('id_usuario')->unsigned();
            $table->foreign('id_usuario')
                ->references('id_usuario')
                ->on('c_usuario')
                ->onDelete('cascade');
            $table->string('ruta_archivo', 255);
            $table->date('fecha')->default(DB::raw('CURRENT_DATE'));
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencias');
    }
};
