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
            $table->enum('sale_type', ['trust','precious_metals','term_life','iul','whole_life','annuity'])
                  ->after('sale_id')
                  ->nullable();
            $table->decimal('commission', 10, 2)
                  ->after('sale_type')
                  ->nullable();
            $table->decimal('total_sale_amount', 15, 2)
                  ->after('commission')
                  ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop the columns if they actually exist
        $drops = [];
        if (Schema::hasColumn('sales', 'sale_type')) {
            $drops[] = 'sale_type';
        }
        if (Schema::hasColumn('sales', 'commission')) {
            $drops[] = 'commission';
        }
        if (Schema::hasColumn('sales', 'total_sale_amount')) {
            $drops[] = 'total_sale_amount';
        }

        if (count($drops) > 0) {
            Schema::table('sales', function (Blueprint $table) use ($drops) {
                $table->dropColumn($drops);
            });
        }
    }
};
