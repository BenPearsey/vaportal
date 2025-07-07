<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOrCalendarAgent
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (
            $user &&
            (
                $user->role === 'admin' ||
                ($user->role === 'agent' && $user->calendar_enabled)
            )
        ) {
            return $next($request);
        }

        abort(403);
    }
}
