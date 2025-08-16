<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sale_checklists', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('sale_id');                   // sales.sale_id (custom PK)
            $t->foreign('sale_id')->references('sale_id')->on('sales')->cascadeOnDelete();
            $t->foreignId('template_id')->constrained('checklist_templates')->cascadeOnDelete();
            $t->string('template_version');
            $t->enum('status', ['active','complete','archived'])->default('active');
            $t->unsignedTinyInteger('progress_cached')->default(0);
            $t->timestamps();
            $t->unique(['sale_id', 'template_id']);              // one instance per sale/template
        });

        Schema::create('sale_checklist_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sale_checklist_id')->constrained('sale_checklists')->cascadeOnDelete();
            $t->foreignId('task_id')->constrained('checklist_tasks')->cascadeOnDelete();
            $t->unsignedBigInteger('parent_item_id')->nullable(); // for repeatable asset groups
            $t->string('assignee_type')->nullable();              // 'admin'|'agent'|'client'|'user'
            $t->unsignedBigInteger('assignee_id')->nullable();    // user_id or role-owned id
            $t->enum('state', [
                'not_started','in_progress','waiting_on_client','uploaded',
                'pending_review','approved','rejected','blocked','complete','na'
            ])->default('not_started');
            $t->timestamp('due_at')->nullable();
            $t->timestamp('started_at')->nullable();
            $t->timestamp('completed_at')->nullable();
            $t->string('blocked_reason')->nullable();
            $t->text('notes')->nullable();                        // audit-lite / override reason
            $t->json('meta')->nullable();                         // per-instance metadata (e.g., “MVTR #2”)
            $t->timestamps();
            $t->index(['sale_checklist_id','parent_item_id']);
        });

        Schema::create('sale_checklist_item_links', function (Blueprint $t) {
            $t->id();
            $t->foreignId('checklist_item_id')->constrained('sale_checklist_items')->cascadeOnDelete();
            $t->string('document_model');                        // 'SaleDocument'
            $t->unsignedBigInteger('document_id');
            $t->enum('review_state', ['pending','approved','rejected'])->default('pending');
            $t->unsignedBigInteger('reviewed_by')->nullable();    // users.id
            $t->string('review_note')->nullable();
            $t->timestamps();
            $t->index(['document_model','document_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('sale_checklist_item_links');
        Schema::dropIfExists('sale_checklist_items');
        Schema::dropIfExists('sale_checklists');
    }
};
