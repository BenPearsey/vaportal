<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use App\Models\Admin;
use App\Models\Agent;
use App\Models\Client;
use App\Observers\SyncContactRoleObserver;
use App\Observers\EventObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
{
    /* ── route groups & middleware (unchanged) ── */
    Route::middleware('web')->group(base_path('routes/web.php'));
    Route::aliasMiddleware('role', RoleMiddleware::class);

    /* ── model observers ── */
    Admin ::observe(SyncContactRoleObserver::class);
    Agent ::observe(SyncContactRoleObserver::class);
    Client::observe(SyncContactRoleObserver::class);
    \App\Models\Event::observe(EventObserver::class);

    /* ── global mail settings (safe API) ── */
    \Mail::alwaysFrom('noreply@verticalalternatives.com', 'VA Portal');
}

}
