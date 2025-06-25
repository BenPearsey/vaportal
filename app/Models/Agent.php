<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Sale;
use App\Models\AgentDocument;
use App\Models\AgentNote;
use App\Models\AgentDocumentFolder;

class Agent extends Model
{
    use HasFactory;

    protected $primaryKey = 'agent_id';

    /**
     * Mass-assignable attributes.
     */
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
        'checklist' => 'array', // ← NEW
    ];

    /* ─────────────── Relationships ─────────────── */

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Parent (upline) agent */
    public function upline()
    {
        return $this->belongsTo(Agent::class, 'upline_agent_id', 'agent_id');
    }

    /** Downline agents, if you ever need them */
    public function downline()
    {
        return $this->hasMany(Agent::class, 'upline_agent_id', 'agent_id');
    }

    public function clients()
    {
        return $this->belongsTo(User::class, 'client_id');
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
}
