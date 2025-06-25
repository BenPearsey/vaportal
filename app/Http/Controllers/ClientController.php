<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function updateOrStore(Request $request)
    {
        $validatedData = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName'  => 'required|string|max:255',
            'email'     => 'required|email',
            'phone'     => 'nullable|string|max:20',
        ]);

        $client = Client::updateOrCreate(
            ['email' => $validatedData['email']],
            $validatedData
        );

        return response()->json([
            'status'  => 'success',
            'client'  => $client,
        ], 200);
    }
}
