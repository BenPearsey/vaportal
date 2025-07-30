<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\{Agent, Client, Contact};

class ContactSyncServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        /* ───── Agents ───── */
        Agent::created(function (Agent $agent) {
            Contact::updateOrCreate(
                ['agent_id' => $agent->agent_id],          // unique key
                [
                    'firstname'  => $agent->firstname,
                    'lastname'   => $agent->lastname,
                    'email'      => $agent->email,         // may be null
                    'phone'      => $agent->phone,
                    'company'    => $agent->company,
                    'agent_id'   => $agent->agent_id,
                    'created_by' => auth()->id() ?? 1,     // fallback system user
                ]
            );
        });

        /* ───── Clients ───── */
        Client::created(function (Client $client) {
            Contact::updateOrCreate(
                ['client_id' => $client->client_id],
                [
                    'firstname'  => $client->firstname,
                    'lastname'   => $client->lastname,
                    'email'      => $client->email,
                    'phone'      => $client->phone,
                    'client_id'  => $client->client_id,
                    'created_by' => auth()->id() ?? 1,
                ]
            );
        });
    }
}
