<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;          // ← for sending notifications
use App\Models\User;                                    // ← to look up admins
use App\Models\Client;
use App\Models\Sale;
use Inertia\Inertia;
use App\Notifications\NewClientCreated;                // ← your new notification
               // ← for creating the update request
use App\Models\ClientUpdateRequest;
use App\Notifications\ClientUpdateRequested;          // ← your new notification


class AgentClientController extends Controller
{
    /**
     * List all clients belonging to this agent.
     */
    public function clients(Request $request)
    {
        $agentId = Auth::user()->agent->agent_id;

        $clients = Client::where('agent_id', $agentId)
            ->select('client_id','firstname','lastname','email','phone','status')
            ->get();

        // possible statuses for filter dropdown
        $statuses = ['Prospect','Active','Inactive'];

        return Inertia::render('agent/clients', [
            'clients'  => $clients,
            'statuses' => $statuses,
            'selected' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? 'All',
            ],
        ]);
    }

    /**
     * Show the “Add Client” form.
     */
    public function create()
    {
        return Inertia::render('agent/create-client');
    }

    /**
     * Store a newly created client.
     * → after create, notify all admins that a new client was added.
     */
    public function store(Request $request)
    {
        $agentId = Auth::user()->agent->agent_id;

        $data = $request->validate([
            'firstname'=>'required|string|max:255',
            'lastname'=>'required|string|max:255',
            'email'=>'required|email|unique:clients,email',
            'phone'=>'nullable|string|max:20',
            'address'=>'nullable|string|max:255',
            'city'=>'nullable|string|max:100',
            'state'=>'nullable|string|max:50',
            'zipcode'=>'nullable|string|max:20',
            'dob'=>'nullable|date',
            'status'=>'required|in:Prospect,Active,Inactive',
        ]);

        $data['agent_id'] = $agentId;
        // never set user_id here; leave it NULL
        // $data['user_id']  = Auth::id();

        $client = Client::create($data);

        // ← NEW: notify all admins of this new client
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, new NewClientCreated($client));

        return redirect()
            ->route('agent.clients')
            ->with('success','Client added.');
    }

    /**
     * Show the client overview page, plus this agent’s sales for that client.
     */
    public function overview(Client $client)
    {
        $agentId = Auth::user()->agent->agent_id;

        // ensure this client belongs to this agent
        abort_unless($client->agent_id === $agentId, 403);

        // fetch all sales for this agent & this client
        $sales = Sale::with('carrierInfo')
            ->where('agent_id', $agentId)
            ->where('client_id', $client->client_id)
            ->select('sale_id','product','carrier_id','total_sale_amount','commission','status','sale_date')
            ->get();

        return Inertia::render('agent/client-overview', [
            'client' => $client,
            'sales'  => $sales,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $agentId = Auth::user()->agent->agent_id;

        // ensure this client belongs to this agent
        abort_unless($client->agent_id === $agentId, 403);

        // only these fields may be changed:
        $validated = $request->validate([
            'email'   => 'required|email',
            'phone'   => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city'    => 'nullable|string|max:255',
            'state'   => 'nullable|string|max:255',
            'zipcode' => 'nullable|string|max:10',
        ]);

        // create a DB-backed “update request” (you already migrated this table)
        $updateRequest = ClientUpdateRequest::create([
            'client_id' => $client->client_id,
            'agent_id'  => $agentId,
            'payload'   => $validated,
            'status'    => 'pending',
        ]);

        // notify all admins that there’s a new request
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, new ClientUpdateRequested($updateRequest));

        return back()->with('success', 'Update request sent. Pending admin approval.');
    }

}
