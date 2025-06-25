<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/…_fix_resource_documents_path.php
public function up(): void
{
    Schema::table('resource_documents', function (Blueprint $t) {
        $t->string('path')->nullable()->change();   // ← was NOT NULL
    });
}

public function down(): void
{
    Schema::table('resource_documents', fn (Blueprint $t) => $t->string('path')->nullable(false)->change());
}

};
