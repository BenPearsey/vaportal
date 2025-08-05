<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// database/migrations/xxxx_xx_xx_xxxxxx_create_user_roles_table.php
return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_roles', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('role_type');           // 'admin' | 'agent' | 'client'
            $t->unsignedBigInteger('role_id'); // admin_id / agent_id / client_id
            $t->timestamps();

            $t->unique(['user_id', 'role_type']);   // 1-per-user-per-role
        });
    }
    public function down(): void { Schema::dropIfExists('user_roles'); }
};

