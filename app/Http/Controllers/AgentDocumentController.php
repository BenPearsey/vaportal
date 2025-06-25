<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AgentDocument;
use App\Models\Agent;
use Illuminate\Support\Facades\Storage;

class AgentDocumentController extends Controller
{
    public function store(Request $request, Agent $agent)
    {
        // Treat folder_id "0" as null (General folder)
        $request->merge(['folder_id' => $request->input('folder_id') === "0" ? null : $request->input('folder_id')]);

        $request->validate([
            'file' => 'required|file',
            'folder_id' => 'nullable|exists:agent_document_folders,id',
            'title' => 'nullable|string|max:255'
        ]);

        $path = $request->file('file')->store('agent-documents', 'public');

        AgentDocument::create([
            'agent_id' => $agent->agent_id,
            'path' => $path,
            'folder_id' => $request->input('folder_id') ?: null,
            'title' => $request->input('title') ?: null,
        ]);

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function show(Agent $agent, AgentDocument $document)
    {
        if ($document->agent_id !== $agent->agent_id) {
            abort(403, 'You are not authorized to view this document.');
        }
        $fullPath = storage_path('app/public/' . $document->path);
        if (!file_exists($fullPath)) {
            abort(404, 'File not found.');
        }
        return response()->file($fullPath);
    }

    public function destroy(Agent $agent, AgentDocument $document)
    {
        if ($document->agent_id !== $agent->agent_id) {
            abort(403, 'Unauthorized action.');
        }
        Storage::disk('public')->delete($document->path);
        $document->delete();
        return back()->with('success', 'Document deleted successfully.');
    }

    public function move(Request $request, Agent $agent, AgentDocument $document)
    {
        if ($document->agent_id !== $agent->agent_id) {
            abort(403, 'Unauthorized action.');
        }
        $request->merge(['folder_id' => $request->input('folder_id') === "0" ? null : $request->input('folder_id')]);
        $request->validate([
            'folder_id' => 'nullable|exists:agent_document_folders,id'
        ]);
        $document->update([
            'folder_id' => $request->input('folder_id') ?: null,
        ]);
        return back()->with('success', 'Document moved successfully.');
    }

    public function rename(Request $request, Agent $agent, AgentDocument $document)
    {
        if ($document->agent_id !== $agent->agent_id) {
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
