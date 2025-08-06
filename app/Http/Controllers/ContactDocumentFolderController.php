<?php

namespace App\Http\Controllers;

use App\Models\ContactDocumentFolder;
use Illuminate\Http\Request;

class ContactDocumentFolderController extends Controller
{
    public function store(Request $r, $contactId)
    {
        $r->validate([
            'name'      => ['required','string','max:255'],
            'parent_id' => ['nullable','exists:contact_document_folders,id'],
        ]);

        ContactDocumentFolder::create([
            'contact_id'=> $contactId,
            'name'      => $r->name,
            'parent_id' => $r->parent_id ?: null,
        ]);

        return back()->with('success','Folder created');
    }

    public function rename(Request $r, ContactDocumentFolder $folder)
    {
        $r->validate(['name'=>['required','string','max:255']]);
        $folder->update(['name'=>$r->name]);

        return back()->with('success','Folder renamed');
    }

    public function move(Request $r, ContactDocumentFolder $folder)
    {
        $r->validate(['parent_id'=>['nullable','exists:contact_document_folders,id']]);
        $folder->update(['parent_id'=>$r->parent_id ?: null]);

        return back()->with('success','Folder moved');
    }

    public function destroy(ContactDocumentFolder $folder)
    {
        // cascade children OR block if not empty (your call)
        $folder->delete();
        return back()->with('success','Folder deleted');
    }
}
