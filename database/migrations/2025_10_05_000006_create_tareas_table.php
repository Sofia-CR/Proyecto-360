<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('tareas', function (Blueprint $table) {
    $table->increments('id_tarea');
    
    $table->integer('id_proyecto');
    $table->foreign('id_proyecto')
          ->references('id_proyecto')
          ->on('proyectos') 
          ->onDelete('cascade');
    $table->integer('id_usuario');
    $table->foreign('id_usuario')
          ->references('id_usuario')
          ->on('c_usuario')
           ->onDelete('cascade');
    $table->string('t_nombre', 100);
    $table->string('t_estatus', 50)->default('Pendiente');
    $table->date('tf_inicio')->nullable();
    $table->date('tf_completada')->nullable();
    $table->text('descripcion')->nullable();
    $table->date('tf_fin')->nullable();
    });

    }
    public function down(): void
    {
        Schema::dropIfExists('tareas');
    }
};
