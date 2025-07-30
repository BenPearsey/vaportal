<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\{Admin, Agent, Client, User};
use App\Observers\ContactSyncObserver;

class EventServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Admin ::observe(ContactSyncObserver::class);
        Agent ::observe(ContactSyncObserver::class);
        Client::observe(ContactSyncObserver::class);
        // User ::observe(ContactSyncObserver::class);   // ← if you want users mirrored
    }
}
