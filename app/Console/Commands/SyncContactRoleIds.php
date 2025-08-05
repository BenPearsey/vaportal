<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\{Contact, Admin, Agent, Client};
use Illuminate\Support\Facades\DB;

class SyncContactRoleIds extends Command
{
    /** the CLI signature you’ll run */
    protected $signature   = 'contacts:sync-role-ids';

    protected $description = 'Back-fill admin_id, agent_id & client_id on existing contacts based on matching email';

    public function handle(): int
    {
        $this->info('Starting contact role-ID sync…');

        Contact::chunkById(200, function ($chunk) {
            foreach ($chunk as $contact) {
                DB::transaction(function () use ($contact) {

                    // admin
                    if (!$contact->admin_id) {
                        $admin = Admin::where('email', $contact->email)->first();
                        if ($admin) $contact->admin_id = $admin->admin_id;
                    }

                    // agent
                    if (!$contact->agent_id) {
                        $agent = Agent::where('email', $contact->email)->first();
                        if ($agent) $contact->agent_id = $agent->agent_id;
                    }

                    // client
                    if (!$contact->client_id) {
                        $client = Client::where('email', $contact->email)->first();
                        if ($client) $contact->client_id = $client->client_id;
                    }

                    $contact->save();   // single UPDATE only if something changed
                });
            }
        });

        $this->info('✓  Finished syncing contacts');
        return Command::SUCCESS;
    }
}
