<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_update_requests', function (Blueprint $table) {
            $table->id();

            // ← point at clients.client_id (not clients.id)
            $table->foreignId('client_id')
                  ->constrained('clients', 'client_id')
                  ->cascadeOnDelete();

            // ← point at agents.agent_id (not agents.id)
            $table->foreignId('agent_id')
                  ->constrained('agents', 'agent_id')
                  ->cascadeOnDelete();

            $table->json('payload');
            $table->enum('status', ['pending','approved','rejected'])
                  ->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_update_requests');
    }
};
