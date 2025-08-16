<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('checklist_templates', function (Blueprint $t) {
            $t->id();
            $t->string('product');                               // 'trust', 'annuity', etc.
            $t->string('version')->default('1.0.0');             // semantic version for template
            $t->string('title');
            $t->enum('status', ['draft','active','archived'])->default('active');
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->unique(['product','version']);
        });

        Schema::create('checklist_stages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('template_id')->constrained('checklist_templates')->cascadeOnDelete();
            $t->string('key');                                   // e.g. 'application'
            $t->string('label');                                 // 'Application'
            $t->unsignedInteger('order')->default(0);
            $t->unsignedTinyInteger('weight')->default(20);      // % contribution to total progress
            $t->timestamps();
            $t->unique(['template_id','key']);
        });

        Schema::create('checklist_tasks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('stage_id')->constrained('checklist_stages')->cascadeOnDelete();
            $t->string('key');                                   // e.g. 'client.certificate.execute_upload'
            $t->string('label');
            $t->enum('role_scope', ['admin','agent','client','mixed'])->default('admin');
            $t->enum('visibility', ['admin','agent','client','all'])->default('all');
            $t->enum('action_type', ['info','file-upload','review','internal','send-to-vendor'])->default('info');
            $t->boolean('requires_review')->default(false);
            $t->boolean('is_repeatable')->default(false);
            $t->enum('repeat_group', ['mvtr','quitclaim','bospn'])->nullable();
            $t->json('dependencies')->nullable();                // array of task keys
            $t->unsignedSmallInteger('default_due_days')->nullable();
            $t->boolean('evidence_required')->default(false);
            $t->json('metadata')->nullable();                    // free-form for copy, helper text, etc.
            $t->timestamps();
            $t->unique(['stage_id','key']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('checklist_tasks');
        Schema::dropIfExists('checklist_stages');
        Schema::dropIfExists('checklist_templates');
    }
};
