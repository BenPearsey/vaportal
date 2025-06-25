<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminDocumentsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('admin_documents', function (Blueprint $table) {
            $table->id();  // Primary key
            $table->unsignedBigInteger('admin_id');  // Admin foreign key
            $table->unsignedBigInteger('folder_id')->nullable();  // Optional folder foreign key
            $table->string('path');  // File path
            $table->string('title')->nullable();  // Optional title
            $table->timestamps();

            // Foreign key constraint on admin_id (assuming your admins table uses admin_id as primary key)
            $table->foreign('admin_id')->references('admin_id')->on('admins')->onDelete('cascade');

            // Optionally, add a foreign key constraint for folder_id if needed:
            // $table->foreign('folder_id')->references('id')->on('admin_document_folders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('admin_documents');
    }
}
