<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyectos_departamentos', function (Blueprint $table) {
    $table->increments('id_proyectos_departamentos');
    $table->integer('id_proyecto');
    $table->foreign('id_proyecto')
          ->references('id_proyecto')
          ->on('proyectos')
          ->onDelete('cascade');
$table->integer('id_departamento');
    $table->foreign('id_departamento')
          ->references('id_departamento')
          ->on('c_departamento')
          ->onDelete('cascade');
    $table->primary(['id_proyecto', 'id_departamento', 'id_proyectos_departamentos']);
});

    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos_departamentos');
    }
};