<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SuperAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Get the current authenticated user.
        $user = $request->user();
        // Retrieve the related admin record (or null if none)
        $admin = $user ? $user->admin : null;
        
        // If admin is not an object or is_super_admin is false, abort.
        if (!is_object($admin) || !$admin->is_super_admin) {
            abort(403, 'Unauthorized.');
        }
        
        return $next($request);
    }
}
