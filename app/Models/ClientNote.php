<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientNote extends Model
{
    use HasFactory;

    protected $primaryKey = 'id'; // Assuming the primary key is 'id'
    protected $fillable = [
        'client_id',
        'content',
        'created_by',
    ];

    // Relationship: Each note belongs to a client
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
