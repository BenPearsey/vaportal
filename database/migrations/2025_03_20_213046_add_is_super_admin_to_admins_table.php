<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddIsSuperAdminToAdminsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('admins', function (Blueprint $table) {
            // Add a boolean column 'is_super_admin', defaulting to false.
            $table->boolean('is_super_admin')->default(false)->after('lastname');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('is_super_admin');
        });
    }
}
