<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner')->nullable();
            $table->integer('expiration')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('cache_locks');
    }
};

