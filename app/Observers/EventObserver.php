<?php

namespace App\Observers;

use App\Models\Event;
use App\Models\ContactHistory;
use Illuminate\Support\Arr;

class EventObserver
{
    public function updated(Event $event): void
    {
        if (! $event->wasChanged('status') || $event->status !== 'completed') {
            return;
        }

        // any contacts invited to this event?
        $contactIds = Arr::pluck($event->contact_participants ?? [], 'id');
        if (! $contactIds) {
            return;
        }

        foreach ($contactIds as $cid) {
            ContactHistory::create([
                'contact_id' => $cid,
                'created_by' => $event->owner_id,
                'type'       => 'completed_' . strtolower($event->activity_type), // e.g. completed_call
                'subject'    => $event->title,
                'details'    => null,
            ]);
        }
    }
}
