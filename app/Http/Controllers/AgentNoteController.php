<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AgentNote;
use App\Models\Agent;
use App\Models\Admin; // Make sure to import the Admin model

class AgentNoteController extends Controller
{
    public function store(Request $request, Agent $agent)
    {
        $request->validate([
            'content' => 'required|string',
            'agent_id' => 'required|integer|exists:agents,agent_id',
        ]);

        // Ensure the user is logged in
        if (!auth()->check()) {
            abort(401, 'Not logged in');
        }

        // Get the current user
        $user = auth()->user();

        // Look for a record in the 'admins' table using user_id
        $adminRecord = Admin::where('user_id', $user->id)->first();
        if (!$adminRecord) {
            // If no matching admin row => unauthorized
            abort(403, 'You are not listed in the admin table');
        }

        // Build the admin name from the admin record
        $adminName = $adminRecord->firstname . ' ' . $adminRecord->lastname;

        AgentNote::create([
            'agent_id'   => $agent->agent_id,
            'content'    => $request->input('content'),
            'created_by' => $adminName,
        ]);

        return back()->with('success', 'Note added successfully.');
    }

    public function destroy(Agent $agent, AgentNote $note)
    {
        if ($note->agent_id !== $agent->agent_id) {
            abort(403, 'Unauthorized action.');
        }
        $note->delete();
        return back()->with('success', 'Note deleted successfully.');
    }
}
