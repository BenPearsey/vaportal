<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\{Agent, Client, Contact};

class SyncExistingContacts extends Command
{
    /*  ───────── Command name & options ─────────  */
    protected $signature   = 'contacts:sync-existing {--dry-run}';
    protected $description = 'Upsert Contact rows for every existing agent & client';

    public function handle(): int
    {
        $dry = $this->option('dry-run');

        /* ─── Agents ─── */
        Agent::chunkById(100, function ($agents) use ($dry) {
            foreach ($agents as $a) {
                $this->upsert($a->email, $a->firstname, $a->lastname, $a->phone, $a->company, $a->agent_id, null, $dry);
            }
        });

        /* ─── Clients ─── */
        Client::chunkById(100, function ($clients) use ($dry) {
            foreach ($clients as $c) {
                $this->upsert($c->email, $c->firstname, $c->lastname, $c->phone, null, null, $c->client_id, $dry);
            }
        });

        $this->info($dry ? 'Dry run finished.' : 'Contacts table synced.');
        return self::SUCCESS;
    }

    /* ---------- helper ---------- */
    private function upsert(
        ?string $email,
        string  $first,
        string  $last,
        ?string $phone,
        ?string $company,
        ?int $agentId,
        ?int $clientId,
        bool $dry
    ): void {
        $contact = $email
            ? Contact::where('email', $email)->first()
            : null;

        if (!$contact && $agentId) {
            $contact = Contact::where('agent_id', $agentId)->first();
        }
        if (!$contact && $clientId) {
            $contact = Contact::where('client_id', $clientId)->first();
        }

        if (!$contact) {
            $contact = new Contact(['created_by' => 1]);
        }

        $contact->fill([
            'firstname' => $first,
            'lastname'  => $last,
            'email'     => $email,
            'phone'     => $phone,
            'company'   => $company,
        ]);

        if ($agentId && !$contact->agent_id)  $contact->agent_id  = $agentId;
        if ($clientId && !$contact->client_id) $contact->client_id = $clientId;

        if ($dry) {
            $this->line("[dry] would save contact {$first} {$last}");
        } else {
            $contact->save();
        }
    }
}
