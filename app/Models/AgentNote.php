<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'content',
        'created_by',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id', 'agent_id');
    }
}
