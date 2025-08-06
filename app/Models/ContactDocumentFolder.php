<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactDocumentFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'contact_id',
        'name',
        'parent_id',
    ];

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function parent()   { return $this->belongsTo(self::class, 'parent_id'); }
    public function children() { return $this->hasMany(self::class,   'parent_id'); }
}
