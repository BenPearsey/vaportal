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
// database/migrations/*create_broadcasts_table.php
Schema::create('broadcasts', function (Blueprint $t) {
    $t->id();
    $t->string('title');
    $t->text('body');
    $t->enum('audience', ['all_agents','all_clients','single_agent','single_client']);
    $t->unsignedBigInteger('agent_id')->nullable();
    $t->unsignedBigInteger('client_id')->nullable();
    $t->string('link')->nullable();
    $t->timestamps();          // created_at = when it was sent
    $t->softDeletes();         // “delete” button won’t really lose data
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('broadcasts');
    }
};
