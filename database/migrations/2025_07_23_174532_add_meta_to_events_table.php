<?php

/* database/migrations/2025_07_24_000000_add_meta_to_events_table.php */
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $t) {
            $t->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $t->string('location')->nullable();
            $t->unsignedInteger('reminder_minutes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $t) {
            $t->dropColumn(['priority', 'location', 'reminder_minutes']);
        });
    }
};
