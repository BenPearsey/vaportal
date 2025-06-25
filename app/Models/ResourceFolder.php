<?php


// app/Models/ResourceFolder.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;


class ResourceFolder extends Model
{
    use HasFactory;

    protected $fillable = ['name','parent_id','bucket','published_for_agents','published_for_clients'];


    /**
     * The parent folder (if any).
     */
    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * The child folders.
     */
    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function documents()
{
  return $this->hasMany(ResourceDocument::class, 'folder_id');
}

}

