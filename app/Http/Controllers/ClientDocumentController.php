<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;       // ← for sending notifications
use App\Models\ClientDocument;
use App\Models\Client;
use App\Models\User;                                // ← to look up admins
use App\Notifications\ClientDocumentUploaded;       // ← your new notification

class ClientDocumentController extends Controller
{
    /**
     * Store (upload) a new document for the given client.
     * → after creating, notify all admins about the new upload.
     */
    public function store(Request $request, Client $client)
    {
        $request->merge(['folder_id' => $request->input('folder_id') === "0" ? null : $request->input('folder_id')]);

        $request->validate([
            'file' => 'required|file',
            'folder_id' => 'nullable|exists:document_folders,id',
            'title' => 'nullable|string|max:255'
        ]);

        // Save file to 'public/client-documents'
        $path = $request->file('file')->store('client-documents', 'public');

        $doc = ClientDocument::create([
            'client_id' => $client->client_id,
            'path' => $path,
            'folder_id' => $request->input('folder_id') ?: null,
            'title' => $request->input('title') ?: null,
        ]);

        // ← NEW: notify all admins of the upload
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, new ClientDocumentUploaded($client, $doc));

        return back()->with('success', 'Document uploaded successfully.');
    }

    /**
     * Show the file in the browser.
     */
    public function show(Client $client, ClientDocument $document)
    {
        if ($document->client_id !== $client->client_id) {
            abort(403, 'You are not authorized to view this document.');
        }
        $fullPath = storage_path('app/public/' . $document->path);

        if (!file_exists($fullPath)) {
            abort(404, 'File not found.');
        }

        return response()->file($fullPath);
    }

    /**
     * Delete a client document.
     */
    public function destroy(Client $client, ClientDocument $document)
    {
        if ($document->client_id !== $client->client_id) {
            abort(403, 'Unauthorized action.');
        }

        // Delete file from storage
        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Document deleted successfully.');
    }

    /**
     * Move a document to a different folder.
     */
    public function move(Request $request, Client $client, ClientDocument $document)
    {
        if ($document->client_id !== $client->client_id) {
            abort(403, 'Unauthorized action.');
        }

        $request->merge(['folder_id' => $request->input('folder_id') === "0" ? null : $request->input('folder_id')]);

        $request->validate([
            'folder_id' => 'nullable|exists:document_folders,id'
        ]);

        $document->update([
            'folder_id' => $request->input('folder_id') ?: null,
        ]);

        return back()->with('success', 'Document moved successfully.');
    }

    /**
     * Rename a document.
     */
    public function rename(Request $request, Client $client, ClientDocument $document)
    {
        if ($document->client_id !== $client->client_id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'title' => 'required|string|max:255'
        ]);

        $document->update([
            'title' => $request->input('title')
        ]);

        return back()->with('success', 'Document renamed successfully.');
    }
}
