<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

class AdminEventController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();

        if ($user->role === 'admin') {
            $events = Event::with('participants')->get();
        } elseif ($user->role === 'agent' && $user->calendar_enabled) {
            $events = Event::with('participants')
                ->where('owner_id', $user->id)
                ->orWhereHas('participants', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->get();
        } else {
            abort(403);
        }

        return response()->json($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();
        $event = Event::create([
            'owner_id' => auth()->id(),
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'start_datetime' => $data['start_datetime'],
            'end_datetime' => $data['end_datetime'],
            'all_day' => $data['all_day'] ?? false,
        ]);

        if (!empty($data['participants'])) {
            $participantData = collect($data['participants'])->mapWithKeys(function ($id) {
                return [$id => ['status' => 'invited']];
            });
            $event->participants()->attach($participantData);
        }

        return response()->json($event->load('participants'));
    }

    public function update(UpdateEventRequest $request, $id): JsonResponse
    {
        $event = Event::with('participants')->findOrFail($id);

        if (Auth::user()->id !== $event->owner_id && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $event->update($request->validated());

        if ($request->has('participants')) {
            $participantData = collect($request->participants)->mapWithKeys(function ($id) {
                return [$id => ['status' => 'invited']];
            });
            $event->participants()->sync($participantData);
        }

        return response()->json($event->load('participants'));
    }

    public function destroy($id): JsonResponse
    {
        $event = Event::findOrFail($id);

        if (Auth::user()->id !== $event->owner_id && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }
}
