<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('c_usuario', function (Blueprint $table) {
    $table->increments('id_usuario');
    $table->integer('id_departamento');
    $table->foreign('id_departamento')
          ->references('id_departamento')
          ->on('c_departamento')
           ->onDelete('cascade');
    $table->string('u_nombre', 50);
    $table->string('a_paterno', 50);
    $table->string('a_materno', 50)->nullable();
    $table->string('telefono', 20)->nullable();
});


    }
    

    public function down(): void
    {
        Schema::dropIfExists('c_usuario');
    }
};
