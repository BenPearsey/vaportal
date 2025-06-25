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
        Schema::table('admins', function (Blueprint $table) {
            // varchar(20) is plenty for international numbers; tweak as needed
            $table->string('phone', 20)
                  ->nullable()        // remove nullable() if you want it required
                  ->after('email');   // put it directly after the email column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};
