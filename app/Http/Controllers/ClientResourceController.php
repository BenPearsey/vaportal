<?php

namespace App\Http\Controllers;

use App\Models\ResourceFolder;
use App\Models\ResourceDocument;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientResourceController extends Controller
{
    /**
     * Folder / document browser.
     */
    public function index()
    {
        $client = auth()->user()->client;

        // top-level folders that are published for clients (bucket 2)
        $folders = ResourceFolder::where('bucket', 2)
            ->whereNull('parent_id')
            ->with([
                // documents directly in that folder
                'documents' => function ($q) {
                    $q->where('published_for_clients', true)
                       ->orderBy('title');
                },
                // one level of sub-folders + each of *their* docs
                'children'  => function ($q) {
                    $q->where('published_for_clients', true)
                       ->orderBy('name')
                       ->with(['documents' => function ($q2) {
                           $q2->where('published_for_clients', true)
                              ->orderBy('title');
                       }]);
                },
            ])
            ->orderBy('name')
            ->get();

        // “general” documents that aren’t in any folder
        $generalDocs = ResourceDocument::whereNull('folder_id')
            ->where('published_for_clients', true)
            ->orderBy('title')
            ->get();

        return Inertia::render('client/forms-resources', [
            'folders'     => $folders,
            'generalDocs' => $generalDocs,
        ]);
    }

    /**
     * Stream a single document (clients only see published docs).
     */
    public function show(ResourceDocument $document)
    {
        abort_unless($document->published_for_clients, 403);

        $path = Storage::disk('public')->path($document->path);
        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Disposition' => 'inline; filename="' .
                ($document->title ?: basename($path)) . '"',
        ]);
    }
}
