<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    /* ---------- mass-assign ---------- */
    protected $fillable = [
        'prefix', 'firstname', 'middle', 'lastname',
        'email', 'phone', 'company', 'notes',
        'created_by', 'agent_id', 'client_id', 'admin_id',
    ];

    /* ---------- virtual attrs ---------- */
    protected $appends = ['roles'];

    public function getRolesAttribute(): array
    {
        $roles = [];
        if ($this->admin_id)  $roles[] = 'Admin';
        if ($this->agent_id)  $roles[] = 'Agent';
        if ($this->client_id) $roles[] = 'Client';

        if (!$roles) {
            $roles[] = $this->user_id ? 'User' : 'Standalone';
        }
        return $roles;
    }

    /* ---------- relationships ---------- */

    /* people */
    public function creator() { return $this->belongsTo(User::class,   'created_by'); }
    public function agent()   { return $this->belongsTo(Agent::class,  'agent_id',  'agent_id'); }
    public function client()  { return $this->belongsTo(Client::class, 'client_id', 'client_id'); }
    public function admin()   { return $this->belongsTo(Admin::class,  'admin_id',  'admin_id'); }

    /* contact ↔ contact */
    public function links()      { return $this->hasMany(ContactLink::class)->with('related'); }
    public function linkedToMe() { return $this->hasMany(ContactLink::class, 'related_contact_id')->with('contact'); }
    public function allLinks()   { return $this->links->merge($this->linkedToMe); }

    /* ───── NEW – documents ───── */
    public function documentFolders() { return $this->hasMany(ContactDocumentFolder::class); }
    public function documents()       { return $this->hasMany(ContactDocument::class); }
}

/* ---------- pivot model (unchanged) ---------- */
class ContactLink extends Model
{
    protected $guarded = [];

    public function contact() { return $this->belongsTo(Contact::class); }
    public function related() { return $this->belongsTo(Contact::class, 'related_contact_id'); }
}
