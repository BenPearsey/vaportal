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
  Schema::create('contact_links', function (Blueprint $t) {
    $t->id();
    $t->foreignId('contact_id')->constrained('contacts')->cascadeOnDelete();
    $t->foreignId('related_contact_id')->constrained('contacts')->cascadeOnDelete();
    $t->string('relation', 30);          // “Spouse”, “Child”, “Coworker” …
    $t->timestamps();

    $t->unique(['contact_id', 'related_contact_id']);   // no dup links
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_links');
    }
};
