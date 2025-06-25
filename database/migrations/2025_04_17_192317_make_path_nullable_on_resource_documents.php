<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resource_documents', function (Blueprint $table) {
            // Make path nullable so that inserts which accidentally
            // omit it will not blow up.
            $table->string('path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('resource_documents', function (Blueprint $table) {
            // Revert back to NOT NULL if you need to
            $table->string('path')->nullable(false)->change();
        });
    }
};
