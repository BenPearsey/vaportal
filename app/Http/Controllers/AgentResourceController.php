<?php

namespace App\Http\Controllers;

use App\Models\ResourceFolder;
use App\Models\ResourceDocument;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AgentResourceController extends Controller
{
    /**
     * Show all folders / documents published for agents.
     */
    public function index()
    {
        $agent = auth()->user()->agent;

        // pass basic agent info into Inertia (you can drop this if you don't need initials right now)
        $agent = Auth::user()->only('id', 'name', 'email');

        // 1) pull **only** the top‑level agent folders (bucket=1), regardless of published_for_agents flag
        //    and eager‑load each folder’s immediate children + their documents.
        $folders = ResourceFolder::where('bucket', 1)
            ->whereNull('parent_id')
            ->with([
                // docs directly in this folder
                'documents' => function($q) {
                    $q->where('published_for_agents', true)
                      ->orderBy('title');
                },
                // one level of sub‑folders
                'children'  => function($q) {
                    $q->orderBy('name')
                      ->with(['documents' => function($q2){
                          $q2->where('published_for_agents', true)
                             ->orderBy('title');
                      }]);
                },
            ])
            ->orderBy('name')
            ->get();

        // 2) any “root‐level” general docs that have been published to agents
        $generalDocs = ResourceDocument::whereNull('folder_id')
            ->where('published_for_agents', true)
            ->orderBy('title')
            ->get();

        return Inertia::render('agent/forms-resources', [
            'agent'       => $agent,
            'folders'     => $folders,
            'generalDocs' => $generalDocs,
        ]);
    }

    /**
     * Stream a single document (only if published for agents).
     */
    public function show(ResourceDocument $document)
    {
        abort_unless($document->published_for_agents, 403);

        $filePath = Storage::disk('public')->path($document->path);
        abort_unless(is_file($filePath), 404);

        return response()->file($filePath, [
            'Content-Disposition' => 'inline; filename="' .
                ($document->title ?: basename($filePath)) .
            '"',
        ]);
    }
}
