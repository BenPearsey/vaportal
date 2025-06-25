<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'parent_id',
        'client_id',
    ];

    public function client()
{
    return $this->belongsTo(Client::class, 'client_id', 'client_id');
}

}
