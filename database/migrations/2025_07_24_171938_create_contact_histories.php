<?php

// database/migrations/2025_07_24_000000_create_contact_histories.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contact_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->enum('type', ['note', 'completed_call', 'completed_meeting', 'completed_task', 'system'])
                  ->default('note');
            $table->string('subject')->nullable();
            $table->text('details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_histories');
    }
};
