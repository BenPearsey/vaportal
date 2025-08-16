<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventAttachmentRequest;
use App\Models\Event;
use App\Models\EventAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    public function destroy(Request $request, Event $event, EventAttachment $attachment): JsonResponse
    {
        $this->ensureCanModify($event);

        if ((int)$attachment->event_id !== (int)$event->id) abort(404);

        Storage::disk($attachment->disk)->delete($attachment->path);
        $attachment->delete();

        return response()->json(['ok' => true]);
    }

    public function download(Request $request, Event $event, EventAttachment $attachment)
    {
        $this->ensureCanView($event);

        if ((int)$attachment->event_id !== (int)$event->id) abort(404);

        return Storage::disk($attachment->disk)
            ->download($attachment->path, $attachment->original_name);
    }

    private function ensureCanModify(Event $event): void
    {
        $u = Auth::user();
        if ($u->role === 'admin' || (int)$u->id === (int)$event->owner_id) return;
        abort(403);
    }

    private function ensureCanView(Event $event): void
    {
        $u = Auth::user();
        if ($u->role === 'admin' || (int)$u->id === (int)$event->owner_id) return;
        abort(403);
    }
}
