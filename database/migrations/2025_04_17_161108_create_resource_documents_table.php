<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('resource_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('folder_id')->nullable();     // may live directly in bucket
            $table->string('path');                                  // storage/app/public/…
            $table->string('title')->nullable();
            $table->boolean('show_to_agents')->default(false);
            $table->boolean('show_to_clients')->default(false);
            $table->string('product')->nullable();                   // future: restrict to product
            $table->timestamps();

            $table->foreign('folder_id')
                  ->references('id')->on('resource_folders')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_documents');
    }
};
