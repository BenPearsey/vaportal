<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resource_folders', function (Blueprint $table) {
            $table->boolean('published_for_agents')
                  ->default(false)
                  ->after('parent_id');
            $table->boolean('published_for_clients')
                  ->default(false)
                  ->after('published_for_agents');
        });

        Schema::table('resource_documents', function (Blueprint $table) {
            $table->boolean('published_for_agents')
                  ->default(false)
                  ->after('title');
            $table->boolean('published_for_clients')
                  ->default(false)
                  ->after('published_for_agents');
        });
    }

    public function down(): void
    {
        Schema::table('resource_folders', function (Blueprint $table) {
            $table->dropColumn(['published_for_agents', 'published_for_clients']);
        });

        Schema::table('resource_documents', function (Blueprint $table) {
            $table->dropColumn(['published_for_agents', 'published_for_clients']);
        });
    }
};
