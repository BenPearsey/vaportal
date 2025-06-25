<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentFolder;
use App\Models\Client; // If needed for route model binding or referencing

class DocumentFolderController extends Controller
{
    /**
     * Store a new folder for the specified client.
     * The folder can optionally belong to a parent folder via 'parent_id'.
     */
    public function store(Request $request, Client $client)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:document_folders,id',
            
        ]);

        DocumentFolder::create([
            'name' => $request->input('name'),
            'parent_id' => $request->input('parent_id'),  // subfolder logic
            'client_id'  => $client->client_id, // <— link folder to this client

        ]);

        return back()->with('success', 'Folder created successfully.');
    }

    /**
     * Destroy the specified folder.
     * Before deletion, we disassociate any documents in this folder.
     */
    public function destroy(DocumentFolder $folder)
    {
        // Set all documents in this folder to folder_id = null
        \App\Models\ClientDocument::where('folder_id', $folder->id)->update(['folder_id' => null]);
        $folder->delete();

        return back()->with('success', 'Folder deleted successfully.');
    }

    /**
     * Rename an existing folder.
     */
    public function rename(Request $request, DocumentFolder $folder)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $folder->update([
            'name' => $request->input('name'),
        ]);

        return back()->with('success', 'Folder renamed successfully.');
    }
}
