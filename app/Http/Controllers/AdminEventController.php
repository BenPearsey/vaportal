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
    /* ------------------------------------------------ list events */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $with = [
            'owner',                    // 👈  NEW: include owner so we know role
            'userParticipants.admin',
            'userParticipants.agent',
            'userParticipants.client',
            'contactParticipants',
        ];

        $builder = Event::with($with);

        // admins see everything; agents see their own + invited
        if ($user->role === 'admin') {
            $events = $builder->get();
        } elseif ($user->role === 'agent' && $user->calendar_enabled) {
            $events = $builder
                ->where('owner_id', $user->id)
                ->orWhereHas('userParticipants', fn ($q) => $q->where('users.id', $user->id))
                ->get();
        } else {
            abort(403);
        }

        return response()->json($events);
    }

    /* ------------------------------------------------ create */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $data  = $request->validated();

        $event = Event::create([
            'owner_id'             => Auth::id(),
            'title'                => $data['title'],
            'description'          => $data['description'] ?? null,
            'start_datetime'       => $data['start_datetime'],
            'end_datetime'         => $data['end_datetime'],
            'all_day'              => $data['all_day'] ?? false,
            'activity_type'        => $data['activity_type'],
            'status'               => $data['status']       ?? 'scheduled',
            'recurrence_rule'      => $data['recurrence_rule']      ?? null,
            'recurrence_exceptions'=> $data['recurrence_exceptions']?? null,
            'is_private'           => $data['is_private']   ?? false,
            'priority'             => $data['priority']         ?? 'medium',
            'location'             => $data['location']         ?? null,
            'reminder_minutes'     => $data['reminder_minutes'] ?? null,
        ]);

        /* attach users */
        if (!empty($data['user_participants'])) {
            $event->userParticipants()
                  ->syncWithPivotValues(
                      $data['user_participants'],
                      ['status' => 'invited']
                  );
        }

        /* attach contacts */
        if (!empty($data['contact_participants'])) {
            $event->contactParticipants()
                  ->syncWithPivotValues(
                      $data['contact_participants'],
                      ['status' => 'invited']
                  );
        }

        return response()->json(
            $event->load([
                'owner',                                  // 👈  include owner
                'userParticipants.admin',
                'userParticipants.agent',
                'userParticipants.client',
                'contactParticipants',
            ])
        );
    }

    /* ------------------------------------------------ update */
    public function update(UpdateEventRequest $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        if (Auth::id() !== $event->owner_id && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $data = $request->validated();
        $event->update($data);

        if ($request->filled('user_participants')) {
            $event->userParticipants()
                  ->syncWithPivotValues(
                      $data['user_participants'],
                      ['status' => 'invited']
                  );
        }

        if ($request->filled('contact_participants')) {
            $event->contactParticipants()
                  ->syncWithPivotValues(
                      $data['contact_participants'],
                      ['status' => 'invited']
                  );
        }

        return response()->json(
            $event->load([
                'owner',                                  // 👈  include owner
                'userParticipants.admin',
                'userParticipants.agent',
                'userParticipants.client',
                'contactParticipants',
            ])
        );
    }

    /* ------------------------------------------------ delete */
    public function destroy($id): JsonResponse
    {
        $event = Event::findOrFail($id);

        if (Auth::id() !== $event->owner_id && Auth::user()->role !== 'admin') {
            abort(403);
        }

        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }
}
