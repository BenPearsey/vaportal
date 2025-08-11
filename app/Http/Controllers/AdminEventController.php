<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventAttachment;
use App\Models\EventEmailInvite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Mail\EventInviteMail;
use Mail;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AdminEventController extends Controller
{
        use AuthorizesRequests;   
    /* ----------------------------------------------------------------- list */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $with = [
            'owner',                                 // so we know its role
            'userParticipants.admin',
            'userParticipants.agent',
            'userParticipants.client',
            'contactParticipants',
            'emailInvites',                         // ←  NEW  (fixes 500)
        ];

        $builder = Event::with($with);

        if ($user->role === 'admin') {
            $events = $builder->get();
        } elseif ($user->role === 'agent' && $user->calendar_enabled) {
            $events = $builder
                ->where('owner_id', $user->id)
                ->orWhereHas('userParticipants', fn ($q) =>
                    $q->where('users.id', $user->id))
                ->get();
        } else {
            abort(403);
        }

        return response()->json($events);
    }

    /* ----------------------------------------------------------------- store */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();

        $event = Event::create(array_merge(
            $data,
            ['owner_id' => Auth::id()]
        ));

        /* users ------------------------------------------------------------ */
        $event->userParticipants()
              ->syncWithPivotValues(
                  $data['user_participants'] ?? [],
                  ['status' => 'invited']
              );

        /* contacts --------------------------------------------------------- */
        $event->contactParticipants()
              ->syncWithPivotValues(
                  $data['contact_participants'] ?? [],
                  ['status' => 'invited']
              );

        /* free-typed e-mails ---------------------------------------------- */
        if (!empty($data['invite_emails'])) {
            $event->emailInvites()->createMany(
                collect($data['invite_emails'])
                    ->unique()
                    ->map(fn ($e) => ['email' => $e, 'status' => 'invited'])
                    ->all()
            );
        }

        /* notify users ----------------------------------------------------- */
        foreach ($event->userParticipants as $user) {
            Mail::to($user->email)->send(new EventInviteMail($event, $user));
        }

        // notify contacts
foreach ($event->contactParticipants as $contact) {
    Mail::to($contact->email)
        ->send(new EventInviteMail($event, $contact));
}

// notify ad-hoc e-mail addresses
foreach ($event->emailInvites as $invite) {
    // wrap in try/catch so one bad address
    // doesn’t kill the rest
    try {
        Mail::to($invite->email)
            ->send(new EventInviteMail($event, $invite->email));
        $invite->update(['status' => 'sent']);
    } catch (\Symfony\Component\Mailer\Exception\TransportExceptionInterface $e) {
        $invite->update(['status' => 'bounced']);
        report($e);               // or log()
    }
}


        return response()->json(
            $event->load([
                'owner',
                'userParticipants.admin',
                'userParticipants.agent',
                'userParticipants.client',
                'contactParticipants',
                'emailInvites',                     // include in payload
            ])
        );
    }

    /* ----------------------------------------------------------------- update */
    public function update(UpdateEventRequest $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->authorize('update', $event);

        $data = $request->validated();
        $event->update($data);

        $event->userParticipants()
              ->syncWithPivotValues(
                  $data['user_participants'] ?? [],
                  ['status' => 'invited']
              );

        $event->contactParticipants()
              ->syncWithPivotValues(
                  $data['contact_participants'] ?? [],
                  ['status' => 'invited']
              );

        /* sync email invites */
        if (array_key_exists('invite_emails', $data)) {
            $event->emailInvites()->delete();               // reset
            $event->emailInvites()->createMany(
                collect($data['invite_emails'])
                    ->unique()
                    ->map(fn ($e) => ['email' => $e, 'status' => 'invited'])
                    ->all()
            );
        }

        return response()->json(
            $event->load([
                'owner',
                'userParticipants.admin',
                'userParticipants.agent',
                'userParticipants.client',
                'contactParticipants',
                'emailInvites',
            ])
        );
    }

    /* ----------------------------------------------------------------- destroy */
    public function destroy($id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->authorize('delete', $event);

        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }

    public function show(Event $event)
{
    //  For now just send them to the calendar with ?event=ID so the SPA
    //  can highlight it; adjust as you build a dedicated page.
    return redirect()->route('admin.calendar', ['event' => $event->id]);
}
}
