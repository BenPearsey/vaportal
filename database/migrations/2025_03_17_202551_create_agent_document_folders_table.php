<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAgentDocumentFoldersTable extends Migration
{
    public function up()
    {
        Schema::create('agent_document_folders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agent_id');
            $table->string('name');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();

            $table->foreign('agent_id')->references('agent_id')->on('agents')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('agent_document_folders')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('agent_document_folders');
    }
}
