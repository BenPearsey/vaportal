<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

/*  ⬇️  Sanctum middleware classes ─────────────── */
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;
/*  ─────────────────────────────────────────────── */

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web     : __DIR__.'/../routes/web.php',
        api     : __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health  : '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        /* ---------- global WEB stack ---------- */
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        /* ---------- Sanctum setup ------------- */
        // 1) Treat same-site API requests as session-authenticated
        $middleware->appendToGroup('api', EnsureFrontendRequestsAreStateful::class);

        // 2) Optional ability middleware aliases
        $middleware->alias([
            'abilities' => CheckAbilities::class,
            'ability'   => CheckForAnyAbility::class,

            // your existing alias
            'adminOrCalendarAgent' => \App\Http\Middleware\AdminOrCalendarAgent::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // …
    })
    ->create();
