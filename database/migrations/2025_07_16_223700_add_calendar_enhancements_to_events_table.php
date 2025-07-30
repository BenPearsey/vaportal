<?php

use Illuminate\Database\Migrations\Migration;
// database/migrations/2025_07_XX_XXXXXX_add_calendar_enhancements_to_events_table.php
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('activity_type')->default('Meeting');
            $table->string('status')->default('scheduled');   // scheduled | completed | canceled
            $table->text('recurrence_rule')->nullable();      // iCal RRULE string
            $table->json('recurrence_exceptions')->nullable(); // dates excluded from the rule
            $table->boolean('is_private')->default(false);    // owner-only visibility
        });

        Schema::create('event_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('minutes_before'); // e.g. 15 = 15-minute pop-up
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_reminders');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'activity_type',
                'status',
                'recurrence_rule',
                'recurrence_exceptions',
                'is_private',
            ]);
        });
    }
};

