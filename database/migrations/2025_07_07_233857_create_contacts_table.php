<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->bigIncrements('id');

            // ───── Identity ─────
            $table->string('prefix')->nullable();
            $table->string('firstname');
            $table->string('middle')->nullable();
            $table->string('lastname');

            // ───── Comms ─────
            $table->string('email')->nullable()->unique();
            $table->string('phone', 30)->nullable();
            $table->string('company')->nullable();
            $table->text('notes')->nullable();

            // ───── Links back to role tables (one-to-one) ─────
            $table->unsignedBigInteger('agent_id')->nullable()->unique();
            $table->unsignedBigInteger('client_id')->nullable()->unique();

            // FK back to the admin who created the row
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            // ───── FK constraints (PKs are agent_id / client_id) ─────
            $table->foreign('agent_id')
                  ->references('agent_id')->on('agents')
                  ->cascadeOnDelete();

            $table->foreign('client_id')
                  ->references('client_id')->on('clients')
                  ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
