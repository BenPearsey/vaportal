<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'client_id';

    protected $fillable = [
        'user_id',
        'agent_id',
        'firstname',
        'lastname',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zipcode',
        'dob',
        'status',
        'bank_name',
        'account_type',
        'account_holder',
        'routing_number',
        'account_number',
    ];

    /* ─────────────── Relationships ─────────────── */

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id', 'agent_id')
                    ->with('contact');           // ← eager-load contact for links
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'client_id');
    }

    public function documents()
    {
        return $this->hasMany(ClientDocument::class, 'client_id');
    }

    public function notes()
    {
        return $this->hasMany(ClientNote::class, 'client_id');
    }

    public function folders()           // legacy alias
    {
        return $this->hasMany(DocumentFolder::class, 'client_id');
    }

    public function documentFolders()   // preferred
    {
        return $this->folders();
    }

    /** 🔗 NEW — back-pointer to the client’s contact record */
    public function contact()
    {
        return $this->hasOne(Contact::class, 'client_id', 'client_id');
    }

    /* ─────────────── Contactable helpers ─────────────── */

    public function contactPayload(): array
    {
        return [
            'firstname' => $this->firstname,
            'lastname'  => $this->lastname,
            'email'     => $this->email,
            'phone'     => $this->phone,
        ];
    }

    public function contactKey(): array
    {
        return ['client_id' => $this->client_id];
    }
}
