<?php

namespace App\Http\Controllers;

use App\Models\{Contact, ContactDocument};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContactDocumentController extends Controller
{
    /* upload ------------------------------------------------------ */
    public function store(Request $request, Contact $contact)
    {
        // “0” = root
        $request->merge(['folder_id' => $request->input('folder_id') === "0" ? null : $request->input('folder_id')]);

        $request->validate([
            'file'      => 'required|file',
            'folder_id' => 'nullable|exists:contact_document_folders,id',
            'title'     => 'nullable|string|max:255',
        ]);

        $path = $request->file('file')->store('contact-documents', 'public');

        ContactDocument::create([
            'contact_id' => $contact->id,
            'folder_id'  => $request->input('folder_id') ?: null,
            'path'       => $path,
            'title'      => $request->input('title') ?: null,
        ]);

        return back()->with('success', 'Document uploaded.');
    }

    /* download / view --------------------------------------------- */
    public function show(Contact $contact, ContactDocument $document)
    {
        abort_if($document->contact_id !== $contact->id, 403);

        $full = storage_path('app/public/' . $document->path);
        abort_if(!file_exists($full), 404, 'File not found.');

        return response()->file($full);
    }

    /* delete ------------------------------------------------------- */
    public function destroy(Contact $contact, ContactDocument $document)
    {
        abort_if($document->contact_id !== $contact->id, 403);

        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }

    /* move --------------------------------------------------------- */
    public function move(Request $req, Contact $contact, ContactDocument $document)
    {
        abort_if($document->contact_id !== $contact->id, 403);

        $req->merge(['folder_id' => $req->input('folder_id') === "0" ? null : $req->input('folder_id')]);
        $req->validate(['folder_id' => 'nullable|exists:contact_document_folders,id']);

        $document->update(['folder_id' => $req->input('folder_id') ?: null]);
        return back()->with('success', 'Document moved.');
    }

    /* rename ------------------------------------------------------- */
    public function rename(Request $req, Contact $contact, ContactDocument $document)
    {
        abort_if($document->contact_id !== $contact->id, 403);
        $req->validate(['title' => 'required|string|max:255']);

        $document->update(['title' => $req->title]);
        return back()->with('success', 'Document renamed.');
    }
}
