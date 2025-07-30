<?php
// database/migrations/2025_07_17_000000_update_event_participants_for_contacts.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_participants', function (Blueprint $t) {
            // 1️⃣  user_id is now optional (so contacts can be invited)
            $t->unsignedBigInteger('user_id')->nullable()->change();

            // 2️⃣  add contact_id
            $t->unsignedBigInteger('contact_id')->nullable()->after('user_id');

            // 3️⃣  foreign key to contacts table
            $t->foreign('contact_id')->references('id')->on('contacts')
              ->cascadeOnDelete();

            // 4️⃣  keep rows unique (one FK at a time)
            $t->unique(['event_id', 'user_id']);
            $t->unique(['event_id', 'contact_id']);
        });
    }

    public function down(): void
    {
        Schema::table('event_participants', function (Blueprint $t) {
            $t->dropUnique(['event_id', 'contact_id']);
            $t->dropForeign(['contact_id']);
            $t->dropColumn('contact_id');

            $t->dropUnique(['event_id', 'user_id']);
            $t->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
};
