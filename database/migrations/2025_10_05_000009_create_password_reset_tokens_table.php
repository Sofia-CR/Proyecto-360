<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
    $table->increments('id');
    $table->string('correo', 100);
    $table->string('token', 64)->unique();
    $table->boolean('usado')->default(false);
    $table->timestamp('creado_en')->default(DB::raw('CURRENT_TIMESTAMP'));
    $table->timestamp('expira_en')->nullable();
});

    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};

