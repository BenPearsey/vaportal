<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Client;
use App\Models\User;
use App\Models\Broadcast;
use App\Notifications\CustomAnnouncement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;
use Illuminate\Database\Eloquent\SoftDeletes;   // ← add this


// app/Http/Controllers/AdminBroadcastController.php
class AdminCustomBroadcastController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/broadcasts-index', [
            'broadcasts' => Broadcast::latest()->paginate(12),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/broadcasts-create', [
            'agents'  => Agent ::select('agent_id','firstname','lastname')->orderBy('firstname')->get(),
            'clients' => Client::select('client_id','firstname','lastname')->orderBy('firstname')->get(),
        ]);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'title'     => 'required|string|max:255',
            'body'      => 'required|string',
            'audience'  => 'required|in:all_agents,all_clients,single_agent,single_client',
            'agent_id'  => 'nullable|exists:agents,agent_id',
            'client_id' => 'nullable|exists:clients,client_id',
            'link'      => 'nullable|url',
        ]);

        // save for admin history
        $broadcast = Broadcast::create($data);

        // resolve recipients → exactly like you already did
        $recipients = match ($data['audience']) {
            'all_agents'   => User::where('role','agent')->get(),
            'all_clients'  => User::where('role','client')->get(),
            'single_agent' => Agent::find($data['agent_id'])?->user,
            'single_client'=> Client::find($data['client_id'])?->user,
        };

        Notification::send(
            $recipients,
            new CustomAnnouncement($data['title'],$data['body'],$data['link'])
        );

        return back()->with('success','Broadcast sent!');
    }

    public function destroy(Broadcast $broadcast)
    {
        $broadcast->delete();
        return back()->with('success','Broadcast deleted.');
    }
}
