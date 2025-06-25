<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminDocumentFoldersTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('admin_document_folders', function (Blueprint $table) {
            $table->id();  // Primary key
            $table->unsignedBigInteger('admin_id');  // Admin foreign key
            $table->string('name');  // Folder name
            $table->unsignedBigInteger('parent_id')->nullable();  // Optional parent folder for subfolder support
            $table->timestamps();

            $table->foreign('admin_id')->references('admin_id')->on('admins')->onDelete('cascade');

            // Self-referencing foreign key for parent folder (optional)
            $table->foreign('parent_id')->references('id')->on('admin_document_folders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('admin_document_folders');
    }
}
