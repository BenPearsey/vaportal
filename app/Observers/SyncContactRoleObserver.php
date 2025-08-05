<?php

// app/Observers/SyncContactRoleObserver.php
namespace App\Observers;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Model;

class SyncContactRoleObserver
{
    /**
     * Fires after **create** and **update** on the watched models.
     * Any Contact that shares the same e-mail and is still missing the
     * relevant FK gets patched.
     */
    public function saved(Model $model): void
    {
        $column = match (class_basename($model)) {
            'Admin'  => 'admin_id',
            'Agent'  => 'agent_id',
            'Client' => 'client_id',
            default  => null,
        };

        if (! $column) {
            return;                       // some other model – ignore
        }

        Contact::whereNull($column)
            ->where('email', $model->email)
            ->update([$column => $model->getKey()]);
    }
}
