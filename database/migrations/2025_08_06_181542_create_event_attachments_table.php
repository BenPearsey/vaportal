<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('event_attachments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('event_id')->constrained()->cascadeOnDelete();
            $t->string('disk', 40)->default('private');
            $t->string('path');
            $t->string('original_name');
            $t->unsignedBigInteger('size');
            $t->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $t->timestamps();

            $t->index('event_id');
        });
    }
    public function down(): void { Schema::dropIfExists('event_attachments'); }
};
