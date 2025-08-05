<?php

// app/Console/Commands/BackfillUserRoles.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Admin;
use App\Models\Agent;
use App\Models\Client;

class BackfillUserRoles extends Command
{
    protected $signature = 'user-roles:backfill';
    protected $description = 'Populate user_roles table from users.role column';

    public function handle()
    {
        $this->info('Back-filling…');

        User::with('roles')->chunk(200, function ($users) {
            foreach ($users as $u) {
                if ($u->role && $u->roles->isEmpty()) {
                    $roleModel = match($u->role) {
                        'admin'  => Admin::where('user_id',$u->id)->first(),
                        'agent'  => Agent::where('user_id',$u->id)->first(),
                        'client' => Client::where('user_id',$u->id)->first(),
                    };
                    if ($roleModel) {
                        UserRole::create([
                            'user_id'   => $u->id,
                            'role_type' => $u->role,
                            'role_id'   => $roleModel->getKey(),
                        ]);
                    }
                }
            }
        });

        $this->info('Done.');
    }
}

