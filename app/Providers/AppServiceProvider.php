<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

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
    }
}
