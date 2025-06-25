<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCarriersTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('carriers', function (Blueprint $table) {
            $table->id(); // auto-incrementing primary key, unsignedBigInteger 'id'
            $table->string('name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('carriers');
    }
}
