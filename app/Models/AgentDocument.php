<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'folder_id',
        'path',
        'title',
    ];

    public function agent()
    {
        // Make sure to reference the proper primary key on the Agent model (e.g., agent_id)
        return $this->belongsTo(Agent::class, 'agent_id', 'agent_id');
    }

    public function folder()
    {
        return $this->belongsTo(AgentDocumentFolder::class, 'folder_id');
    }
}
