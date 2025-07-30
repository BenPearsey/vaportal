<?php

// database/migrations/2025_07_23_000000_add_admin_id_to_contacts.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $t) {
            $t->unsignedBigInteger('admin_id')->nullable()->after('client_id')->index();
            $t->foreign('admin_id')->references('admin_id')->on('admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $t) {
            $t->dropForeign(['admin_id']);
            $t->dropColumn('admin_id');
        });
    }
};
