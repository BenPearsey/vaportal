<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateSalesTableCarrierColumn extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('sales', function (Blueprint $table) {
            // If the old "carrier" column exists, drop it.
            if (Schema::hasColumn('sales', 'carrier')) {
                $table->dropColumn('carrier');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            // Add the new carrier_id column. Set it as nullable.
            $table->unsignedBigInteger('carrier_id')->nullable()->after('product');
            // Optionally, add a foreign key constraint referencing the carriers table.
            $table->foreign('carrier_id')->references('id')->on('carriers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeign(['carrier_id']);
            $table->dropColumn('carrier_id');
        });
        // Optionally, you could add the "carrier" column back if needed.
        Schema::table('sales', function (Blueprint $table) {
            $table->string('carrier')->nullable();
        });
    }
}
