<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (!Schema::hasColumn('clients', 'email')) {
                $table->string('email')->unique()->after('lastname');
            }
            if (!Schema::hasColumn('clients', 'phone')) {
                $table->string('phone')->nullable()->after('email');
            }
            if (!Schema::hasColumn('clients', 'state')) {
                $table->string('state')->nullable()->after('city');
            }
            if (!Schema::hasColumn('clients', 'dob')) {
                $table->date('dob')->nullable()->after('zipcode');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'email')) {
                $table->dropColumn('email');
            }
            if (Schema::hasColumn('clients', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('clients', 'state')) {
                $table->dropColumn('state');
            }
            if (Schema::hasColumn('clients', 'dob')) {
                $table->dropColumn('dob');
            }
        });
    }
};
