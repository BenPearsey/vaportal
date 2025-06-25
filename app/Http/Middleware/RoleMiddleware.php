<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role): Response
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login'); // Redirect if not logged in
        }

        // Check if user's role matches the required role.
        if ($user->role === $role) {
            return $next($request);
        }

        // Redirect unauthorized users
        return redirect()->route('home')->with('error', 'Unauthorized access.');
    }
}
