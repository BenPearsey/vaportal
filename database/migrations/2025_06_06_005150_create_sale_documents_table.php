<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_documents', function (Blueprint $table) {
            $table->id();                               // local PK
            $table->unsignedBigInteger('sale_id');      // FK → sales.sale_id
            $table->string('title')->nullable();
            $table->string('path');
            $table->timestamps();

            $table->foreign('sale_id')
                  ->references('sale_id')->on('sales')  // <- NOTE the column name
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_documents');
    }
};
