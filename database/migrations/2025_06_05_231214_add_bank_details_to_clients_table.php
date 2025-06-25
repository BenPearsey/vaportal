<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/XXXX_XX_XX_add_bank_details_to_clients_table.php
return new class extends Migration {
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('bank_name')->nullable();
            $table->enum('account_type', ['Checking','Savings','Other'])->nullable();
            $table->string('account_holder')->nullable();
            $table->string('routing_number')->nullable();   // encrypted cast → plaintext size fine
            $table->string('account_number')->nullable();   // encrypted cast → plaintext size fine
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'bank_name','account_type','account_holder',
                'routing_number','account_number'
            ]);
        });
    }
};
