<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentDocumentFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'name',
        'parent_id',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id', 'agent_id');
    }

    public function parent()
    {
        return $this->belongsTo(AgentDocumentFolder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(AgentDocumentFolder::class, 'parent_id');
    }
}
