<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
// app/Http/Middleware/RoleMiddleware.php
public function handle(Request $request, Closure $next, $role): Response
{
    $user   = Auth::user();
    $active = strtolower(trim(session('active_role') ?? $user->role));

    if ($active === $role) {
        return $next($request);        // ✓ allowed
    }

    abort(403);                        // ✕ stop, don’t redirect
}

}