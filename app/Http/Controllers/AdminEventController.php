<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Mail\EventInviteMail;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AdminEventController extends Controller
{
    /* -------------------------------------------------------------- list */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $with = [
            'owner',
            'userParticipants.admin',
            'userParticipants.agent',
            'userParticipants.client',
            'contactParticipants',
            'emailInvites',
            'attachments', // ← include attachments everywhere
        ];

        $builder = Event::with($with);

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

    /* -------------------------------------------------------------- store (no e-mail here) */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $data  = $request->validated();
        $event = Event::create(array_merge($data, ['owner_id' => Auth::id()]));

        $event->userParticipants()
              ->syncWithPivotValues($data['user_participants'] ?? [], ['status' => 'invited']);

        $event->contactParticipants()
              ->syncWithPivotValues($data['contact_participants'] ?? [], ['status' => 'invited']);

        // free-typed e‑mails (no status writes to avoid DB enum issues)
        if (!empty($data['invite_emails'])) {
            $event->emailInvites()->createMany(
                collect($data['invite_emails'])
                    ->unique()
                    ->map(fn ($e) => ['email' => $e])
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
                'attachments',
            ])
        );
    }

    /* -------------------------------------------------------------- update */
    public function update(UpdateEventRequest $request, $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->ensureCanModify($event);

        $data = $request->validated();
        $event->update($data);

        $event->userParticipants()
              ->syncWithPivotValues($data['user_participants'] ?? [], ['status' => 'invited']);

        $event->contactParticipants()
              ->syncWithPivotValues($data['contact_participants'] ?? [], ['status' => 'invited']);

        if (array_key_exists('invite_emails', $data)) {
            $event->emailInvites()->delete();
            $event->emailInvites()->createMany(
                collect($data['invite_emails'])
                    ->unique()
                    ->map(fn ($e) => ['email' => $e])
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
                'attachments',
            ])
        );
    }

    /* -------------------------------------------------------------- destroy */
    public function destroy($id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $this->ensureCanModify($event);
        $event->delete();

        return response()->json(['message' => 'Event deleted.']);
    }

    /* -------------------------------------------------------------- send invites (after uploads) */
    public function invite(Event $event): JsonResponse
    {
        $this->ensureCanModify($event);

        $event->loadMissing(['attachments','userParticipants','contactParticipants','emailInvites']);

        $sent   = 0;
        $failed = [];

        $send = function (string $email, $recipient) use ($event, &$sent, &$failed) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $failed[] = $email; return; }
            try {
                // ensure attachments relation is populated inside the mailable
                Mail::to($email)->send(new EventInviteMail($event->fresh()->load('attachments'), $recipient));
                $sent++;
            } catch (\Throwable $e) {
                report($e);
                $failed[] = $email;
            }
        };

        foreach ($event->userParticipants as $u)   { if ($u->email)   $send($u->email,   $u); }
        foreach ($event->contactParticipants as $c){ if ($c->email)   $send($c->email,  $c); }
        foreach ($event->emailInvites as $inv)     { if ($inv->email) $send($inv->email, $inv->email); }

        return response()->json(['ok' => true, 'sent' => $sent, 'failed' => $failed]);
    }

    public function show(Event $event)
    {
        return redirect()->route('admin.calendar', ['event' => $event->id]);
    }

    /* -------------------------------------------------------------- helpers */
    private function ensureCanModify(Event $event): void
    {
        $user = Auth::user();
        if ($user && ($user->role === 'admin' || (int)$event->owner_id === (int)$user->id)) {
            return;
        }
        abort(403);
    }
}
