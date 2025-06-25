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
        //Schema::table('resource_documents', function (Blueprint $table) {
           // $table->foreignId('user_id')
                  //->nullable()                     // or remove nullable() if you always require it
                  //->constrained('users')
                 // ->cascadeOnDelete();
        //});
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
  
    }
};
