<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'folder_id',
        'path',
        'title',
    ];

    /* owners */
    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function folder()
    {
        return $this->belongsTo(ContactDocumentFolder::class, 'folder_id');
    }
}
