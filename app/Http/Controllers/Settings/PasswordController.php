<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the *role-specific* password form.
     */
    public function edit(Request $request): Response
    {
        $role = $request->user()->role;               // admin | agent | client

        return Inertia::render("$role/settings/password");
    }

    /**
     * Update password – same validation as starter.
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'current_password'      => ['required', 'current_password'],
            'password'              => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($data['password']),
        ]);

        return back()->with('status', 'password-updated');
    }
}
