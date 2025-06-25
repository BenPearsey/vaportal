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
        Schema::table('resource_documents', function (Blueprint $t) {
            $t->dropColumn(['show_to_agents', 'show_to_clients']);
        });
    }
    public function down(): void { /* you can ignore */ }
    
};
