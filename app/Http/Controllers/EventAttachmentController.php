<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventAttachmentRequest;
use App\Models\Event;
use App\Models\EventAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EventAttachmentController extends Controller
{
    public function store(StoreEventAttachmentRequest $req, Event $event): JsonResponse
    {
        $file = $req->file('file');
        $path = $file->store("events/{$event->id}", 'private');

        $att = EventAttachment::create([
            'event_id'      => $event->id,
            'disk'          => 'private',
            'path'          => $path,
            'original_name' => $file->getClientOriginalName(),
            'size'          => $file->getSize(),
            'uploaded_by'   => $req->user()->id,
        ]);

        return response()->json($att->only(['id','original_name','size','download_url']));
    }

    public function destroy(Event $event, EventAttachment $attachment): JsonResponse
    {
        $this->authorize('update', $event); // same rule as edit
        Storage::disk($attachment->disk)->delete($attachment->path);
        $attachment->delete();

        return response()->json(['ok'=>true]);
    }
}
