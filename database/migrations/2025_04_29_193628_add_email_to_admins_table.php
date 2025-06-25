<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add the column.
     */
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            // You can change nullable()/unique() to suit your needs
            $table->string('email')->unique()->after('lastname');
        });
    }

    /**
     * Rollback.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('email');
        });
    }
};
