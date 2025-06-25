<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAgentNotesTable extends Migration
{
    public function up()
    {
        Schema::create('agent_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agent_id');
            $table->text('content');
            $table->string('created_by')->nullable();
            $table->timestamps();

            $table->foreign('agent_id')->references('agent_id')->on('agents')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('agent_notes');
    }
}
