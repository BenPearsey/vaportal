<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_email_invites', function (Blueprint $table) {
            $table->id();

            // ---- relations ----
            $table->foreignId('event_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // ---- invite details ----
            $table->string('email')->index();
            $table->enum('status', ['invited', 'accepted', 'declined'])
                  ->default('invited');

            $table->timestamps();

            // one invite per event/email
            $table->unique(['event_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_email_invites');
    }
};
