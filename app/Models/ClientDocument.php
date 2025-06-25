<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'path',
        'folder_id',
        'title',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }
}
