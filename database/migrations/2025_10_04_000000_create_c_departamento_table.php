<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('c_departamento', function (Blueprint $table) {
            $table->increments('id_departamento');
            $table->string('d_nombre', 100);
            $table->unsignedBigInteger('area_id'); // referencia a areas
            $table->timestamps();

            // Clave foránea con ON DELETE CASCADE
            $table->foreign('area_id')
                  ->references('id')
                  ->on('c_areas')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('c_departamento');
    }
};
