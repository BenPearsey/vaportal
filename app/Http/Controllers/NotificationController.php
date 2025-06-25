<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function markRead($id)
    {
        $notification = auth()->user()->unreadNotifications()->findOrFail($id);
        $notification->markAsRead();
        return back();
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    }
    public function index(Request $request)
    {
        $page = $request->user()
                        ->notifications()
                        ->latest()
                        ->paginate(20);

        return Inertia::render('admin/notifications', [
            'notifications' => $page,
        ]);
    }

    /**
     * Render Agent notifications listing
     */
    public function agentIndex(Request $request)
    {
        $page = $request->user()
                        ->notifications()
                        ->latest()
                        ->paginate(20);

        return Inertia::render('agent/notifications', [
            'notifications' => $page,
        ]);
    }

    /**
     * Render Client notifications listing
     */
    public function clientIndex(Request $request)
    {
        $page = $request->user()
                        ->notifications()
                        ->latest()
                        ->paginate(20);

        return Inertia::render('client/notifications', [
            'notifications' => $page,
        ]);
    }

    // app/Http/Controllers/NotificationController.php

public function agentShow($id)
{
    $n = request()->user()->notifications()->findOrFail($id);
    return Inertia::render('agent/notification-show', ['notification' => $n]);
}

public function clientShow($id)
{
    $n = request()->user()->notifications()->findOrFail($id);
    return Inertia::render('client/notification-show', ['notification' => $n]);
}

// quick “mark as read” routes (already used in reader page)
public function agentRead($id)
{
    auth()->user()->notifications()->findOrFail($id)->markAsRead();
    return back();
}

public function clientRead($id)
{
    auth()->user()->notifications()->findOrFail($id)->markAsRead();
    return back();
}

}
