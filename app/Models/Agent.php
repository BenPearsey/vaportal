<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    use HasFactory;

    protected $primaryKey = 'agent_id';

    protected $fillable = [
        'user_id',
        'upline_agent_id',
        'email',
        'prefix',
        'firstname',
        'middle',
        'lastname',
        'nickname',
        'address',
        'city',
        'zipcode',
        'tax_id',
        'company',
        'phone',
        'checklist',
    ];

    protected $casts = [
        'checklist' => 'array',
    ];

    /* ─────────────── Relationships ─────────────── */

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function upline()
    {
        return $this->belongsTo(self::class, 'upline_agent_id', 'agent_id');
    }

    public function downline()
    {
        return $this->hasMany(self::class, 'upline_agent_id', 'agent_id');
    }

    /** Clients managed by this agent */
    public function clients()
    {
        return $this->hasMany(Client::class, 'agent_id', 'agent_id')
                    ->with('contact');           // ← eager-load contact for convenience
    }

    public function sales()
    {
        return $this->hasMany(Sale::class, 'agent_id');
    }

    public function documents()
    {
        return $this->hasMany(AgentDocument::class, 'agent_id', 'agent_id');
    }

    public function notes()
    {
        return $this->hasMany(AgentNote::class, 'agent_id', 'agent_id');
    }

    public function documentFolders()
    {
        return $this->hasMany(AgentDocumentFolder::class, 'agent_id', 'agent_id');
    }

    /** 🔗 NEW — back-pointer to the agent’s contact record */
    public function contact()
    {
        return $this->hasOne(Contact::class, 'agent_id', 'agent_id');
    }

    /* ─────────────── Contactable helpers ─────────────── */

    public function contactPayload(): array
    {
        return [
            'firstname' => $this->firstname,
            'lastname'  => $this->lastname,
            'email'     => $this->email,
            'phone'     => $this->phone,
            'company'   => $this->company,
        ];
    }

    public function contactKey(): array
    {
        return ['agent_id' => $this->agent_id];
    }
}
