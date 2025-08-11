<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/xxxx_alter_event_email_invites_status_column.php
return new class extends Migration {
    public function up(): void
    {
        Schema::table('event_email_invites', function (Blueprint $table) {
            $table->string('status', 20)->default('queued')->change();
        });
    }
    public function down(): void
    {
        Schema::table('event_email_invites', function (Blueprint $table) {
            $table->tinyInteger('status')->default(0)->change();   // or whatever it was
        });
    }
};

