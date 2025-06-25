<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAgentDocumentsTable extends Migration
{
    public function up()
    {
        Schema::create('agent_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agent_id');
            $table->unsignedBigInteger('folder_id')->nullable();
            $table->string('path');
            $table->string('title')->nullable();
            $table->timestamps();

            $table->foreign('agent_id')->references('agent_id')->on('agents')->onDelete('cascade');
            $table->foreign('folder_id')->references('id')->on('agent_document_folders')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('agent_documents');
    }
}
