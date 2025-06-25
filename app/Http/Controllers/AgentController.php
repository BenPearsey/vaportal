<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function updateOrStore(Request $request)
    {
        $validatedData = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName'  => 'required|string|max:255',
            'email'     => 'required|email',
            'phone'     => 'nullable|string|max:20',
            // Add agent-specific fields here...
        ]);

        $agent = Agent::updateOrCreate(
            ['email' => $validatedData['email']],
            $validatedData
        );

        return response()->json([
            'status' => 'success',
            'agent'  => $agent
        ], 200);
    }
}
