<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use App\Models\Admin;
use App\Models\Agent;
use App\Models\Client;
use App\Observers\SyncContactRoleObserver;

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
        // Define your routes inside the 'routes' directory
        Route::middleware('web')
            ->group(base_path('routes/web.php'));

        // Register custom middleware
        Route::aliasMiddleware('role', RoleMiddleware::class);

                Route::macro('sortable', function () {
            /** @var \Illuminate\Routing\Route $this */
            $this->whereAlpha('column');
            return $this;

    Admin ::observe(SyncContactRoleObserver::class);
    Agent ::observe(SyncContactRoleObserver::class);
    Client::observe(SyncContactRoleObserver::class);
        });

            \App\Models\Event::observe(\App\Observers\EventObserver::class);

    }
}
