<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdminDocument; // Ensure you have an AdminDocument model
use App\Models\AdminDocumentFolder; 
use App\Models\Admin; // To check ownership if needed
use Illuminate\Support\Facades\Storage;

class AdminAdminDocumentController extends Controller
{
    /**
     * Display a listing of the admin documents.
     */
    public function index(Request $request)
    {
        // Optionally, you can filter documents for the current admin.
        // Here we retrieve all admin documents.
        $documents = AdminDocument::all();
        $folders   = AdminDocumentFolder::all();

        // You might instead use Inertia::render(...) if you have a view.
        return inertia('admin/admin-documents', [
            'documents' => $documents,
            'folders'   => $folders
        ]);
    }

    /**
     * Show the form for creating a new admin document.
     */
    public function create()
    {
        // Return the Inertia page for uploading a document.
        return inertia('admin/admin-documents-create');
    }

    /**
     * Store a newly created admin document in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file'      => 'required|file',
            'folder_id' => 'nullable|exists:admin_document_folders,id',
            'title'     => 'nullable|string|max:255',
        ]);

        // Store file in the "admin-documents" directory on the "public" disk.
        $path = $request->file('file')->store('admin-documents', 'public');

        // Create a new admin document record.
        AdminDocument::create([
            // Assuming you want to assign documents to the currently authenticated admin:
            'admin_id'  => $request->user()->admin->admin_id,
            'path'      => $path,
            'folder_id' => $request->input('folder_id') ?: null,
            'title'     => $request->input('title') ?: null,
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    /**
     * Display the specified admin document.
     */
    public function show(Request $request, $document)
    {
        $document = AdminDocument::findOrFail($document);
        // Optional: Check that the current admin owns this document.
        // if ($document->admin_id !== $request->user()->admin->admin_id) {
        //     abort(403, 'Unauthorized');
        // }
        $fullPath = storage_path('app/public/' . $document->path);
        if (!file_exists($fullPath)) {
            abort(404, 'File not found.');
        }
        return response()->file($fullPath);
    }

    /**
     * Remove the specified admin document from storage.
     */
    public function destroy($document)
    {
        $document = AdminDocument::findOrFail($document);
        // Optionally, verify ownership.
        Storage::disk('public')->delete($document->path);
        $document->delete();
        return back()->with('success', 'Document deleted successfully.');
    }

    /**
     * Move the specified document to a new folder.
     */
    public function move(Request $request, $document)
    {
        $document = AdminDocument::findOrFail($document);
        $request->validate([
            'folder_id' => 'nullable|exists:admin_document_folders,id',
        ]);
        $document->update([
            'folder_id' => $request->input('folder_id') ?: null,
        ]);
        return back()->with('success', 'Document moved successfully.');
    }

    /**
     * Rename the specified document.
     */
    public function rename(Request $request, $document)
    {
        $document = AdminDocument::findOrFail($document);
        $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $document->update([
            'title' => $request->input('title'),
        ]);
        return back()->with('success', 'Document renamed successfully.');
    }

    /* ────────────────────────────────  FOLDERS  ───────────────────────── */

    /** POST admin/admin-documents/folders  */
    public function storeFolder(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required','string','max:255'],
            'parent_id' => ['nullable','exists:admin_document_folders,id'],
        ]);

        AdminDocumentFolder::create([
            'admin_id'  => $request->user()->admin->admin_id,
            'name'      => $data['name'],
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return back()->with('success','Folder created.');
    }

    /** POST admin/admin-documents/folders/{folder}/rename */
    public function renameFolder(Request $request, AdminDocumentFolder $folder)
    {
        $request->validate(['name' => ['required','string','max:255']]);
        $folder->update(['name' => $request->name]);
        return back()->with('success','Folder renamed.');
    }

    /** POST admin/admin-documents/folders/{folder}/move */
    public function moveFolder(Request $request, AdminDocumentFolder $folder)
    {
        $request->validate([
            'parent_id' => ['nullable','exists:admin_document_folders,id'],
        ]);
        $folder->update(['parent_id' => $request->parent_id ?: null]);
        return back()->with('success','Folder moved.');
    }

    /** DELETE admin/admin-documents/folders/{folder} */
    public function destroyFolder(AdminDocumentFolder $folder)
    {
        // delete descendant docs + sub-folders if you need to
        $folder->delete();
        return back()->with('success','Folder deleted.');
    }
}

