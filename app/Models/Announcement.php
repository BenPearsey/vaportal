<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'admin_id',
        'title',
        'type',
        'content',
        'description',
        'published_at',
        'created_at',
    ];
    
    // If you have an Admin model, you can add a relationship:
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}
