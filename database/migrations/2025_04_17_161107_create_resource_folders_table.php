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
        Schema::create('resource_folders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            /* 0 = General, 1 = Agents, 2 = Clients (keeps it simple) */
            $table->tinyInteger('bucket')->default(0);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')
                  ->references('id')->on('resource_folders')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resource_folders');
    }
};
