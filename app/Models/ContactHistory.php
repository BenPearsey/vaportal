<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ContactHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id', 'created_by', 'type',
        'subject', 'details',
    ];

    /* relationships */
    public function contact()  { return $this->belongsTo(Contact::class); }
    public function creator()  { return $this->belongsTo(User::class, 'created_by'); }
}
