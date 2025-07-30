<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\StoreContactLinkRequest;
use App\Models\Contact;
use App\Models\ContactLink;
use App\Http\Controllers\ContactController;

class ContactLinkController extends Controller
{
    public function store(StoreContactLinkRequest $r, Contact $contact)
{
    $contact->links()->create($r->validated());
    return back()->with('success','Linked contact added');
}

public function destroy(Contact $contact, ContactLink $link)
{
    abort_unless($link->contact_id == $contact->id
              || $link->related_contact_id == $contact->id, 403);

    $link->delete();
    return back()->with('success','Link removed');
}

}
