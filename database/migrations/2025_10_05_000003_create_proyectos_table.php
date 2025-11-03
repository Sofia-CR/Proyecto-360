<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('proyectos', function (Blueprint $table) {
    $table->increments('id_proyecto');
    $table->integer('id_departamento');
    $table->foreign('id_departamento')
          ->references('id_departamento')
          ->on('c_departamento')
          ->onDelete('cascade');
    $table->string('p_nombre', 100)->nullable();
    $table->date('pf_inicio')->nullable();
    $table->date('pf_fin')->nullable();
    $table->string('p_estatus', 50)->default('EN PROCESO');
    $table->text('descripcion')->nullable();
});


    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos');
    }
};
