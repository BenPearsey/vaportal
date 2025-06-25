<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Agent;
use App\Models\Sale;                      // ← for sales
use App\Models\ClientDocument;
use App\Models\ClientNote;
use App\Models\DocumentFolder;
use App\Models\User;                      // ← for creating the user
use App\Mail\NewClientWelcomeMail;        // ← your new mailable
use Illuminate\Support\Str;              // ← for generating temp password
use Illuminate\Support\Facades\Hash;      // ← to hash it
use Illuminate\Support\Facades\Mail;      // ← to send it
use Illuminate\Support\Facades\Log;       // ← to catch mail errors
use Inertia\Inertia;

class AdminClientController extends Controller
{
    /**
     * List all clients.
     */
    public function clients()
    {
        // eager-load user relation so you can tell who already has an account
        $clients = Client::with('user')->get();

        return Inertia::render('admin/clients', [
            'clients' => $clients,
        ]);
    }

    /**
     * Create client page.
     */
    public function create()
    {
        $agents = Agent::select('agent_id as id', 'firstname', 'lastname')->get();

        return Inertia::render('admin/add-client', [
            'agents' => $agents,
        ]);
    }

    /**
     * Store a new client.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'firstname'   => 'required|string|max:255',
            'lastname'    => 'required|string|max:255',
            'email'       => 'required|email|unique:clients,email',
            'phone'       => 'nullable|string|max:20',
            'address'     => 'nullable|string|max:255',
            'city'        => 'nullable|string|max:255',
            'state'       => 'nullable|string|max:255',
            'zipcode'     => 'nullable|string|max:10',
            'dob'         => 'nullable|date',
            'status'      => 'required|in:Prospect,Active,Inactive',
            'agent_id'    => 'nullable|exists:agents,agent_id',
            'create_user' => 'sometimes|boolean',               // ← NEW
            'bank_name'      => 'nullable|string|max:255',
            'account_type'   => 'nullable|in:Checking,Savings,Other',
            'account_holder' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:20',
            'account_number' => 'nullable|string|max:20',
        ]);

        // never tie this new client to the creator
        $validated['user_id'] = null;                           // ← UPDATED

        $client = Client::create($validated);

        // if admin checked “Create user account?”, fire off the same logic as createUser()
        if (! empty($validated['create_user'])) {               // ← NEW
            // generate temp password
            $tempPassword = Str::random(8);

            // create the user
            $user = User::create([
                'email'    => $client->email,
                'password' => Hash::make($tempPassword),
                'role'     => 'client',
            ]);

            // link to client
            $client->user_id = $user->id;
            $client->save();

            // send welcome email
            try {
                Mail::to($client->email)
                    ->send(new NewClientWelcomeMail($client, $tempPassword));
            } catch (\Exception $e) {
                Log::error('Client welcome email failed: ' . $e->getMessage());
                // we’re still going to redirect below; they’ll see a flash error
                return redirect()
                    ->route('admin.clients.overview', $client)
                    ->with('warning', 'Client created; but welcome email failed.');
            }

            return redirect()
                ->route('admin.clients.overview', $client)
                ->with('success', 'Client + user account created; temporary password sent.');
        }

        return redirect()
            ->route('admin.clients.overview', $client)
            ->with('success', 'Client added successfully.');
    }

    /**
     * Create a user record for a client who doesn’t yet have one,
     * send them a temporary password by email.
     */
    public function createUser(Client $client)
    {
        if ($client->user_id) {
            return redirect()->back()
                ->with('error', 'This client already has a user account.');
        }

        // generate temp password
        $tempPassword = Str::random(8);

        // create the user
        $user = User::create([
            'email'    => $client->email,
            'password' => Hash::make($tempPassword),
            'role'     => 'client',
        ]);

        // link to client
        $client->user_id = $user->id;
        $client->save();

        // send welcome email
        try {
            Mail::to($client->email)
                ->send(new NewClientWelcomeMail($client, $tempPassword));
        } catch (\Exception $e) {
            Log::error('Client welcome email failed: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'User created but email sending failed.');
        }

        return redirect()->back()
            ->with('success', 'User account created; temporary password sent via email.');
    }

    /**
     * Show the client overview page, including documents, notes, and folders.
     */
    public function overview(Client $client)
    {
        // eager-load agent and user
        $client->load(['agent','user']);

        $documents = ClientDocument::where('client_id', $client->client_id)->get();
        $notes     = ClientNote::where('client_id', $client->client_id)->get();
        $folders   = DocumentFolder::where('client_id', $client->client_id)->get();
        $agents    = Agent::select('agent_id as id', 'firstname', 'lastname')->get();
        $sales     = Sale::where('client_id', $client->client_id)->get(); 

        return Inertia::render('admin/client-overview', [
            'client'    => $client,
            'documents' => $documents,
            'notes'     => $notes,
            'folders'   => $folders,
            'agents'    => $agents,
            'sales'     => $sales,
        ]);
    }

    /**
     * Edit client page (if you use a dedicated page).
     */
    public function edit(Client $client)
    {
        return Inertia::render('admin/clients/edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update client.
     */
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname'  => 'required|string|max:255',
            'email'     => 'required|email|unique:clients,email,' . $client->client_id . ',client_id',
            'phone'     => 'nullable|string|max:20',
            'address'   => 'nullable|string|max:255',
            'city'      => 'nullable|string|max:255',
            'state'     => 'nullable|string|max:255',
            'zipcode'   => 'nullable|string|max:10',
            'dob'       => 'nullable|date',
            'status'    => 'required|in:Prospect,Active,Inactive',
            'agent_id'  => 'nullable|exists:agents,agent_id',
            'bank_name'      => 'nullable|string|max:255',
            'account_type'   => 'nullable|in:Checking,Savings,Other',
            'account_holder' => 'nullable|string|max:255',
            'routing_number' => 'nullable|string|max:20',
            'account_number' => 'nullable|string|max:20',
        ]);

        $client->update($validated);

        return redirect()
            ->route('admin.clients.overview', $client)
            ->with('success', 'Client updated successfully.');
    }

    /**
     * Delete client.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()
            ->route('admin.clients')
            ->with('success', 'Client deleted successfully.');
    }
}
