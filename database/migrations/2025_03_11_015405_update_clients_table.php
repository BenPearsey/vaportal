<?php 

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('clients', function (Blueprint $table) {
            if (!Schema::hasColumn('clients', 'state')) {
                $table->string('state')->nullable()->after('city'); // ✅ Add state if missing
            }

            if (!Schema::hasColumn('clients', 'status')) {
                $table->enum('status', ['Prospect', 'Active', 'Inactive'])->default('Prospect')->after('zipcode'); // ✅ Add status
            }
        });
    }

    public function down()
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['state', 'status']);
        });
    }
};
