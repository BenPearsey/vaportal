<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    // Get the authenticated user
    $user = Auth::user();

    // Redirect based on role using the role column
    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    } elseif ($user->role === 'agent') {
        return redirect()->route('agent.dashboard');
    } elseif ($user->role === 'client') {
        return redirect()->route('client.dashboard');
    }

    // Fallback: If no role is set, render an error view or message.
    return redirect()->route('home')->withErrors(['role' => 'No dashboard is assigned for your account.']);
}

/**
 * Destroy an authenticated session (Logout function).
 */
public function destroy(Request $request): RedirectResponse
{
    Auth::guard('web')->logout(); // Log out the user

    $request->session()->invalidate(); // Invalidate the session
    $request->session()->regenerateToken(); // Regenerate CSRF token

    return redirect()->route('login'); // Redirect to login screen
}

}
