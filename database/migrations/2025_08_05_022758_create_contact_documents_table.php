<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contact_id');
            $table->unsignedBigInteger('folder_id')->nullable();
            $table->string('path');          // storage path (public disk)
            $table->string('title')->nullable();
            $table->timestamps();

            /* FK → contacts */
            $table->foreign('contact_id')
                  ->references('id')->on('contacts')
                  ->cascadeOnDelete();

            /* FK → folders */
            $table->foreign('folder_id')
                  ->references('id')->on('contact_document_folders')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_documents');
    }
};
