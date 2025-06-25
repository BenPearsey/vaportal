<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'folder_id',
        'path',
        'title',
    ];

    public function admin()
    {
        // Make sure your Admin model uses 'admin_id' as its primary key.
        return $this->belongsTo(Admin::class, 'admin_id', 'admin_id');
    }

    public function folder()
    {
        return $this->belongsTo(AdminDocumentFolder::class, 'folder_id');
    }
}
