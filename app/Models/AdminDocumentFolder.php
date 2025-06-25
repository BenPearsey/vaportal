<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminDocumentFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'name',
        'parent_id',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id', 'admin_id');
    }

    public function parent()
    {
        return $this->belongsTo(AdminDocumentFolder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(AdminDocumentFolder::class, 'parent_id');
    }
}
