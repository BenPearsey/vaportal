<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetActiveRole
{
    public function handle($request, Closure $next)
    {
        $user = $request->user();

        if (
            $user &&
            $user->roles->count() > 1 &&                 // only multi-role users
            ! $request->session()->has('active_role')    // not already chosen
        ) {
            $request->session()->put(
                'active_role',
                $user->roles->first()->role_type         // default to first
            );
        }

        return $next($request);
    }
}
