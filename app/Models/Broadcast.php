<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;   // ← add this


// app/Models/Broadcast.php
class Broadcast extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'title','body','audience','agent_id','client_id','link',
    ];
    public function agent () { return $this->belongsTo(Agent::class); }
    public function client() { return $this->belongsTo(Client::class); }
}
