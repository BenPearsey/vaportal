<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClientNote;
use App\Models\Client;

class ClientNoteController extends Controller
{
    public function store(Request $request, Client $client)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        // 2) Ensure user is logged in
    if (!auth()->check()) {
        abort(401, 'Not logged in');
    }

    // 3) Get the current user
    $user = auth()->user();

    // 4) Look for a record in the 'admins' table
    //    using user_id = $user->id
    $adminRecord = \App\Models\Admin::where('user_id', $user->id)->first();
    if (!$adminRecord) {
        // If no matching admin row => unauthorized
        abort(403, 'You are not listed in the admin table');
    }

    // 5) Build the admin name from the admin row
    $adminName = $adminRecord->firstname . ' ' . $adminRecord->lastname;

        ClientNote::create([
            'client_id'  => $client->client_id,
            'content'    => $request->input('content'),
            'created_by' => $adminName,
        ]);

        // (Optional) return updated notes or partial data
        $notes = ClientNote::where('client_id', $client->client_id)
                          ->orderByDesc('id')
                          ->get();

        return back()->with([
            'notes'   => $notes,
            'message' => 'Note added successfully!',
        ]);
    }

    public function destroy(Client $client, ClientNote $note)
    {
        $note->delete();
        return back()->with('success', 'Note deleted successfully.');
    }
}
