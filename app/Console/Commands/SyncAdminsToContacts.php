<?php
namespace App\Console\Commands;                // ← add namespace

use Illuminate\Console\Command;               // ← import the base class
use App\Models\Admin;
use App\Models\Contact;

// app/Console/Commands/SyncAdminsToContacts.php
class SyncAdminsToContacts extends Command
{
    protected $signature = 'contacts:sync-admins';
    protected $description = 'Ensure every admin has a matching contacts row';

    public function handle()
    {
        \App\Models\Admin::with('user')->cursor()->each(function ($admin) {
            \App\Models\Contact::firstOrCreate(
                ['admin_id' => $admin->admin_id],
                [
                    'firstname' => $admin->firstname,
                    'lastname'  => $admin->lastname,
                    'email'     => $admin->email,
                    'phone'     => $admin->phone,
                    // add other fields as you like
                    'created_by'=> 1,          // system user or whoever
                ]
            );
        });

        $this->info('Admins synced to contacts.');
    }
}
