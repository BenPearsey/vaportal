<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AgentDocumentFolder;
use App\Models\Agent;

class AgentDocumentFolderController extends Controller
{
    public function store(Request $request, Agent $agent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:agent_document_folders,id',
        ]);

        AgentDocumentFolder::create([
            'name' => $request->input('name'),
            'parent_id' => $request->input('parent_id'),
            'agent_id' => $agent->agent_id,
        ]);

        return back()->with('success', 'Folder created successfully.');
    }

    public function destroy(AgentDocumentFolder $folder)
    {
        // Disassociate documents in this folder before deletion
        \App\Models\AgentDocument::where('folder_id', $folder->id)->update(['folder_id' => null]);
        $folder->delete();
        return back()->with('success', 'Folder deleted successfully.');
    }

    public function rename(Request $request, AgentDocumentFolder $folder)
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
