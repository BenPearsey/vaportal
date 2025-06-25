<?php
namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        // 1) start with parent props
        $shared = parent::share($request);

        // 2) add our own
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $shared['name']  = config('app.name');
        $shared['quote'] = [
            'message' => trim($message),
            'author'  => trim($author),
        ];

        // 3) auth user + admin relationship
        $shared['auth'] = [
            'user'  => $request->user(),
            'admin' => $request->user() && $request->user()->role === 'admin'
                ? $request->user()->admin
                : null,
        ];

        // 4) notifications
        if ($request->user()) {
            $unread = $request->user()->unreadNotifications;
            $shared['notifications'] = $unread
                ->take(10)
                ->map(fn($n) => [
                    'id'      => $n->id,
                    'type'    => class_basename($n->type),
                    'data'    => $n->data,
                    'created' => $n->created_at->diffForHumans(),
                ])
                ->toArray();
            $shared['unreadCount'] = $unread->count();
        } else {
            $shared['notifications'] = [];
            $shared['unreadCount']   = 0;
        }

        return $shared;
    }
}
