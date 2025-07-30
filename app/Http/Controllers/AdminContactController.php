<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\{Agent, Client, Contact, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Event; 
use App\Models\ContactHistory;


class AdminContactController extends Controller
{
    /* ───── CRUD ───── */

public function index(Request $request)
{
    // accepted sort keys => DB columns
    $sortCol = $request->get('sort', 'lastname');
    $sortDir = $request->get('dir', 'asc');
    $allowed = [
        'firstname' => 'firstname',
        'lastname'  => 'lastname',
        'email'     => 'email',
        'company'   => 'company',
        'created'   => 'created_at',
    ];
    if (!isset($allowed[$sortCol])) {
        $sortCol = 'lastname';   // fallback
    }

    $contacts = Contact::with(['agent', 'client'])
        ->orderBy($allowed[$sortCol], $sortDir)
        ->paginate(25)
        ->appends($request->only('sort','dir'));  // keep params when paging

    return Inertia::render('admin/contacts', [
        'contacts'   => $contacts,
        'sortCol'    => $sortCol,
        'sortDir'    => $sortDir,
    ]);
}


    public function create()
    {
        return Inertia::render('admin/contacts-create');
    }

    public function store(StoreContactRequest $request)
    {
        Contact::create(
            $request->validated() + ['created_by' => $request->user()->id]
        );

        return to_route('admin.contacts.index')
            ->with('success', 'Contact added');
    }



public function show(Contact $contact)
{
    /* ----------------------------------------------------------------
       Eager-load everything we need in ONE query                       */
$contact->load([
    // key column first, then what we actually need
    'admin:admin_id,user_id',
    'agent:agent_id,user_id',
    'client:client_id,user_id',
    'creator:id,email',

    'links.related:id,firstname,lastname',         // outgoing
    'links.contact:id,firstname,lastname',
    'linkedToMe.related:id,firstname,lastname',     // incoming
    'linkedToMe.contact:id,firstname,lastname',
]);
    

$allLinks = $contact->links->merge($contact->linkedToMe)->values();

    /* --------------------------------------------------------------- */
    /* Find the user-id that “belongs” to this contact (if any)        */
    $userId = $contact->admin->user_id  ??    // linked admin
              $contact->agent->user_id  ??    // linked agent
              $contact->client->user_id ??    // linked client
              null;

    /* --------------------------------------------------------------- */
    /* 1) events where the CONTACT is invited
       2) OR   events where the USER is invited (when we found one)   */
    $events = Event::query()
        ->whereHas('contactParticipants',
            fn ($q) => $q->where('contacts.id', $contact->id)
        )
        ->when($userId, fn ($q) =>
            $q->orWhereHas('userParticipants',
                fn ($qq) => $qq->where('users.id', $userId)
            )
        )
        ->with([
            'owner:id,email',
            'userParticipants:id,email',
            'contactParticipants:id,firstname,lastname',
        ])
        ->orderBy('start_datetime', 'desc')
        ->get();

    /* quick notes / history ---------------------------------------- */
    $histories = ContactHistory::where('contact_id', $contact->id)
        ->with('creator:id,email')
        ->latest()
        ->get();

    /* Inertia payload ---------------------------------------------- */
    return Inertia::render('admin/contacts-show', [
        'contact' => array_merge(
            $contact->toArray(),
            [
                'events'    => $events,
                'histories' => $histories,
                'links'     => $allLinks,   // now overrides correctly
            ]
        ),
    ]);
}


    /** Show the edit form */
    public function edit(Contact $contact)
    {
        // light eager-load so role badges still work
        $contact->load(['admin','agent','client']);

        return Inertia::render('admin/contacts-edit', [
            'contact' => $contact,
        ]);
    }

    /** Persist edits */
    public function update(UpdateContactRequest $request, Contact $contact)
    {
        DB::transaction(function () use ($request, $contact) {
            $contact->update($request->validated());

            // ⤵︎ future checkbox toggles (convert to Agent/Admin/Client) will live here
            // if ($request->boolean('as_agent') && ! $contact->agent_id) { … }
        });

        return redirect()
            ->route('admin.contacts.show', $contact->id)
            ->with('success', 'Contact updated');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return back()->with('success', 'Contact deleted');
    }

    /* ───── Conversions ───── */

    public function convertToAgent(Request $request, Contact $contact)
    {
        if ($contact->agent_id) {
            return back()->with('error', 'Already linked to an agent');
        }

        $createUser = ! $request->boolean('create_user') === false;

        DB::transaction(function () use ($contact, $createUser) {
            $userId = null;

            if ($createUser) {
                $user = User::create([
                    'email'             => $contact->email,
                    'password'          => bcrypt(str()->random(12)),
                    'role'              => 'agent',
                    'calendar_enabled'  => 1,
                ]);
                $userId = $user->id;
            }

            $agent = Agent::create([
                'user_id'   => $userId,
                'firstname' => $contact->firstname,
                'lastname'  => $contact->lastname,
                'email'     => $contact->email,
                'phone'     => $contact->phone,
                'company'   => $contact->company,
            ]);

            $contact->update(['agent_id' => $agent->agent_id]);
        });

        return to_route('admin.contacts.index')
            ->with('success', 'Converted to agent');
    }

    public function convertToClient(Request $request, Contact $contact)
    {
        if ($contact->client_id) {
            return back()->with('error', 'Already linked to a client');
        }

        $createUser = ! $request->boolean('create_user') === false;

        DB::transaction(function () use ($contact, $createUser) {
            $userId = null;

            if ($createUser) {
                $user = User::create([
                    'email'    => $contact->email,
                    'password' => bcrypt(str()->random(12)),
                    'role'     => 'client',
                ]);
                $userId = $user->id;
            }

            $client = Client::create([
                'user_id'   => $userId,
                'firstname' => $contact->firstname,
                'lastname'  => $contact->lastname,
                'email'     => $contact->email,
                'phone'     => $contact->phone,
            ]);

            $contact->update(['client_id' => $client->client_id]);
        });

        return to_route('admin.contacts.index')
            ->with('success', 'Converted to client');
    }

 

public function storeHistory(Request $req, Contact $contact)
{
    $req->validate([
        'note' => ['required','string'],
    ]);

    ContactHistory::create([
        'contact_id' => $contact->id,
        'created_by' => $req->user()->id,
        'type'       => 'note',
        'subject'    => 'Quick note',
        'details'    => $req->note,
    ]);

    return back()->with('success','Note added');
}

}
