<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Agent;
use App\Models\Sale;
use App\Models\ClientDocument;
use App\Models\ClientNote;
use App\Models\User;

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
        'agent',
        'bank_name',
        'account_type',
        'account_holder',
        'routing_number',
        'account_number',
    ];



    // Relationship: A client belongs to an agent
    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    // Relationship: A client has many sales
    public function sales()
    {
        return $this->hasMany(Sale::class, 'client_id');
    }

    // Relationship: A client has many documents
    public function documents()
    {
        return $this->hasMany(ClientDocument::class, 'client_id');
    }

    // Relationship: A client has many notes
    public function notes()
    {
        return $this->hasMany(ClientNote::class, 'client_id');
    }

    // NEW: Relationship to the User record
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


}
