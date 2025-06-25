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
        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'email')) {
                $table->string('email')->after('client_id');
            }
            if (!Schema::hasColumn('sales', 'phone')) {
                $table->string('phone')->after('email');
            }
            if (!Schema::hasColumn('sales', 'product')) {
                $table->string('product')->after('phone');
            }
            if (!Schema::hasColumn('sales', 'carrier')) {
                $table->string('carrier')->nullable()->after('product');
            }
            if (!Schema::hasColumn('sales', 'total_sale_amount')) {
                $table->decimal('total_sale_amount', 10, 2)->nullable()->after('carrier');
            }
            if (!Schema::hasColumn('sales', 'status')) {
                $table->enum('status', [
                    'Waiting for Funds',
                    'Waiting for Documents',
                    'Processing',
                    'Waiting for Carrier',
                    'Completed',
                    'Cancelled'
                ])->default('Waiting for Funds');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'email')) {
                $table->dropColumn('email');
            }
            if (Schema::hasColumn('sales', 'phone')) {
                $table->dropColumn('phone');
            }
            if (Schema::hasColumn('sales', 'product')) {
                $table->dropColumn('product');
            }
            if (Schema::hasColumn('sales', 'carrier')) {
                $table->dropColumn('carrier');
            }
            if (Schema::hasColumn('sales', 'total_sale_amount')) {
                $table->dropColumn('total_sale_amount');
            }
            if (Schema::hasColumn('sales', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
