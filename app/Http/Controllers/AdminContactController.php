<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\{
    Admin, Agent, Client, Contact, ContactDocument, ContactDocumentFolder,
    User, Event, ContactHistory
};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Admin-side CRUD + Contact Hub
 */
class AdminContactController extends Controller
{
    /* ───────────────────────── LIST & CREATE ───────────────────────── */

    public function index(Request $request)
    {
        $sortCol = $request->get('sort', 'lastname');
        $sortDir = $request->get('dir',  'asc');
        $allowed = [
            'firstname'=>'firstname','lastname'=>'lastname','email'=>'email',
            'company'=>'company','created'=>'created_at',
        ];
        if (! isset($allowed[$sortCol])) $sortCol = 'lastname';

        $contacts = Contact::with(['admin','agent','client'])
            ->orderBy($allowed[$sortCol], $sortDir)
            ->paginate(25)
            ->appends($request->only('sort','dir'));

        return Inertia::render('admin/contacts', [
            'contacts'=> $contacts,
            'sortCol' => $sortCol,
            'sortDir' => $sortDir,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/contacts-create');
    }

    public function store(StoreContactRequest $req)
    {
        Contact::create($req->validated() + ['created_by' => $req->user()->id]);
        return to_route('admin.contacts.index')->with('success', 'Contact added');
    }

    /* ─────────────────────────── CONTACT HUB ───────────────────────── */

    public function hub(Contact $contact)
    {
        /* 1) base profile + immediate relations */
        $contact->load([
            'admin','agent','client','creator',
            'documents:id,contact_id,folder_id,title,path',
            'documentFolders:id,contact_id,parent_id,name',
            'links.related:id,firstname,lastname',
            'linkedToMe.contact:id,firstname,lastname',
        ]);

        /* 2) role-specific bundles ─────────────────────────────────── */
        $agentBundle  = null;
        $clientBundle = null;

        /* ───────── Agent view ───────── */
        if ($contact->agent) {
            $ag = $contact->agent->load([
                'documents',
                'documentFolders',
                'notes',
                'sales',
                //  NEW  → need each client’s contact.id for hub link
                'clients.contact',
            ]);

            $agentBundle = [
                'core'      => $ag,
                'docs'      => $ag->documents,
                'dirs'      => $ag->documentFolders,
                'notes'     => $ag->notes,
                'sales'     => $ag->sales,
                'clients'   => $ag->clients,      // each $client now has ->contact
                'checklist' => $ag->checklist,
            ];
        }

        /* ───────── Client view ───────── */
        if ($contact->client) {
            $cl = $contact->client->load([
                'documents',
                'documentFolders',
                'notes',
                'sales',
                //  NEW  → so the client tab can link back to agent hub
                'agent.contact',
            ]);

            $clientBundle = [
                'core'  => $cl,
                'docs'  => $cl->documents,
                'dirs'  => $cl->documentFolders,
                'notes' => $cl->notes,
                'sales' => $cl->sales,
            ];
        }

        /* 3) documents & folders (for the Contact itself) */
        $documents = $contact->documents;
        $folders   = $contact->documentFolders;

        /* 4) activities */
        $userId = $contact->admin->user_id  ??
                  $contact->agent->user_id  ??
                  $contact->client->user_id ?? null;

        $events = Event::query()
            ->whereHas('contactParticipants',
                fn ($q) => $q->where('contacts.id', $contact->id))
            ->when($userId, fn ($q) =>
                $q->orWhereHas('userParticipants',
                    fn ($qq) => $qq->where('users.id', $userId)))
            ->with([
                'owner:id,email',
                'userParticipants:id,email',
                'contactParticipants:id,firstname,lastname',
            ])
            ->orderBy('start_datetime', 'desc')
            ->get();

        /* 5) quick-note history */
        $histories = ContactHistory::where('contact_id', $contact->id)
                     ->with('creator:id,email')
                     ->latest()
                     ->get();

        /* 6) output */
        return Inertia::render('admin/contact-hub', [
            'contact'   => $contact,
            'documents' => $documents,
            'folders'   => $folders,
            'events'    => $events,
            'histories' => $histories,
            'links'     => $contact->allLinks(),

            // role bundles (each now contains nested contact IDs)
            'client'    => $clientBundle,
            'agent'     => $agentBundle,
        ]);
    }

    /* ─────────────────────────── LEGACY SHOW ───────────────────────── */

    public function show(Contact $contact)
    {
        /* unchanged … */
        $contact->load([
            'admin:admin_id,user_id',
            'agent:agent_id,user_id',
            'client:client_id,user_id',
            'creator:id,email',
            'links.related:id,firstname,lastname',
            'links.contact:id,firstname,lastname',
            'linkedToMe.related:id,firstname,lastname',
            'linkedToMe.contact:id,firstname,lastname',
        ]);

        $allLinks = $contact->links->merge($contact->linkedToMe)->values();

        $userId = $contact->admin->user_id  ??
                  $contact->agent->user_id  ??
                  $contact->client->user_id ?? null;

        $events = Event::query()
            ->whereHas('contactParticipants',
                fn ($q) => $q->where('contacts.id', $contact->id))
            ->when($userId, fn ($q) =>
                $q->orWhereHas('userParticipants',
                    fn ($qq) => $qq->where('users.id', $userId)))
            ->with([
                'owner:id,email',
                'userParticipants:id,email',
                'contactParticipants:id,firstname,lastname',
            ])
            ->orderBy('start_datetime', 'desc')
            ->get();

        $histories = ContactHistory::where('contact_id',$contact->id)
                      ->with('creator:id,email')->latest()->get();

        return Inertia::render('admin/contacts-show', [
            'contact'=> array_merge($contact->toArray(), [
                'events'   => $events,
                'histories'=> $histories,
                'links'    => $allLinks,
            ]),
        ]);
    }

    /* ───────────── EDIT | UPDATE | DESTROY ───────────── */

    public function edit(Contact $c)
    {
        $c->load(['admin','agent','client']);
        return Inertia::render('admin/contacts-edit',['contact'=>$c]);
    }

    public function update(UpdateContactRequest $r, Contact $c)
    {
        DB::transaction(fn () => $c->update($r->validated()));
        return to_route('admin.contacts.hub', $c->id)
               ->with('success', 'Contact updated');
    }

    public function destroy(Contact $c)
    {
        $c->delete();
        return back()->with('success', 'Contact deleted');
    }

    /* ────────────────────────── CONVERSIONS ───────────────────────── */

    public function convertToAgent(Request $r, Contact $c)
    {
        if ($c->agent_id) return back()->with('error','Already an agent');

        $createUser = $r->boolean('create_user');

        DB::transaction(function () use ($c, $createUser) {
            $userId = null;
            if ($createUser) {
                $u = User::create([
                    'email'            => $c->email,
                    'password'         => bcrypt(str()->random(12)),
                    'role'             => 'agent',
                    'calendar_enabled' => 1,
                ]);
                $userId = $u->id;
            }

            $agent = Agent::create([
                'user_id'  => $userId,
                'firstname'=> $c->firstname,
                'lastname' => $c->lastname,
                'email'    => $c->email,
                'phone'    => $c->phone,
                'company'  => $c->company,
            ]);

            $c->update(['agent_id' => $agent->agent_id]);
        });

        return to_route('admin.contacts.hub', $c->id)
               ->with('success', 'Converted to agent');
    }

    public function convertToClient(Request $r, Contact $c)
    {
        if ($c->client_id) return back()->with('error','Already a client');

        $createUser = $r->boolean('create_user');

        DB::transaction(function () use ($c, $createUser) {
            $userId = null;
            if ($createUser) {
                $u = User::create([
                    'email'    => $c->email,
                    'password' => bcrypt(str()->random(12)),
                    'role'     => 'client',
                ]);
                $userId = $u->id;
            }

            $client = Client::create([
                'user_id'  => $userId,
                'firstname'=> $c->firstname,
                'lastname' => $c->lastname,
                'email'    => $c->email,
                'phone'    => $c->phone,
            ]);

            $c->update(['client_id' => $client->client_id]);
        });

        return to_route('admin.contacts.hub', $c->id)
               ->with('success', 'Converted to client');
    }

    /* ───────────────────────── QUICK NOTES ───────────────────────── */

    public function storeHistory(Request $r, Contact $contact)
    {
        $r->validate(['note' => ['required','string']]);

        ContactHistory::create([
            'contact_id' => $contact->id,
            'created_by' => $r->user()->id,
            'type'       => 'note',
            'subject'    => 'Quick note',
            'details'    => $r->note,
        ]);

        return back()->with('success', 'Note added');
    }

    public function updateHistory(Request $req, Contact $contact, ContactHistory $history)
    {
        $req->validate(['details' => ['required','string']]);
        $history->update(['details' => $req->details]);

        return back()->with('success', 'Note updated');
    }

    public function destroyHistory(Contact $contact, ContactHistory $history)
    {
        $history->delete();
        return back()->with('success', 'Note deleted');
    }
}
