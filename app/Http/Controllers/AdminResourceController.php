<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\ResourceFolder;
use App\Models\ResourceDocument;

class AdminResourceController extends Controller
{
    public function index()
    {
        $admin = auth()->user()->admin;

        return Inertia::render('admin/forms-resources', [
            'folders'   => ResourceFolder::orderBy('name')->get(),
            'documents' => ResourceDocument::with(['uploader.admin'])
                               ->orderBy('title')
                               ->get(),

        ]);
    }

    public function show(ResourceDocument $document)
    {
        abort_unless($document->path, 404);
        $file = Storage::disk('public')->path($document->path);
        abort_unless(is_file($file), 404);

        return response()->file($file, [
            'Content-Disposition' => 'inline; filename="' .
                ($document->title ?: basename($file)) . '"',
        ]);
    }

    public function storeDocument(Request $r)
    {
        $r->validate([
            'file'   => 'required|file|max:20480',
            'title'  => 'nullable|string|max:255',
            'folder_id'            => 'nullable|exists:resource_folders,id',
            'published_for_agents' => 'boolean',
            'published_for_clients'=> 'boolean',
        ]);

        $path = $r->file('file')->store('resources', 'public');

        ResourceDocument::create([
            'user_id'               => auth()->id(),
            'folder_id'             => $r->folder_id ?: null,
            'title'                 => $r->title ?: $r->file('file')->getClientOriginalName(),
            'path'                  => $path,
            'published_for_agents'  => $r->boolean('published_for_agents'),
            'published_for_clients' => $r->boolean('published_for_clients'),
        ]);
        

        return back();
    }

    public function moveDocument(Request $r, ResourceDocument $document)
    {
        $r->validate(['folder_id' => 'nullable|exists:resource_folders,id']);
        $document->update(['folder_id' => $r->folder_id ?: null]);
        return back();
    }

    public function renameDocument(Request $r, ResourceDocument $document)
    {
        $r->validate(['title' => 'required|string|max:255']);
        $document->update(['title' => $r->title]);
        return back();
    }

    public function toggleDocument(ResourceDocument $document, Request $r)
    {
        $r->validate([
            'column' => 'required|in:published_for_agents,published_for_clients',
            'value'  => 'required|boolean',
        ]);

        $document->{$r->column} = $r->boolean('value');
        $document->save();

        return back();
    }

    public function destroyDocument(Request $r, ResourceDocument $document)
    {
        $scope = $r->input('scope', 'general');
        if ($scope === 'agents') {
            $document->update(['published_for_agents' => false]);
            return back();
        }
        if ($scope === 'clients') {
            $document->update(['published_for_clients' => false]);
            return back();
        }

        if ($document->path) {
            Storage::disk('public')->delete($document->path);
        }
        $document->delete();
        return back();
    }

    public function storeFolder(Request $r)
    {
        $r->merge(['bucket' => (string)$r->bucket]);
        $r->validate([
            'name'      => 'required|string|max:255',
            'bucket'    => 'required|in:0,1,2',
            'parent_id' => 'nullable|exists:resource_folders,id',
        ]);

        ResourceFolder::create([
            'name'      => $r->name,
            'bucket'    => (int)$r->bucket,
            'parent_id' => $r->parent_id ?: null,
        ]);

        return back();
    }

    public function renameFolder(ResourceFolder $folder, Request $r)
    {
        $r->validate(['name' => 'required|string|max:255']);
        $folder->update(['name' => $r->name]);
        return back();
    }

    public function moveFolder(ResourceFolder $folder, Request $r)
    {
        $r->validate(['parent_id' => 'nullable|exists:resource_folders,id']);
        $folder->update(['parent_id' => $r->parent_id ?: null]);
        return back();
    }

    public function destroyFolder(ResourceFolder $folder)
    {
       
        ResourceDocument::where('folder_id', $folder->id)->update(['folder_id' => null]);
        $folder->delete();
        return back();
    }
}
