<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;


class ResourceDocument extends Model
{
    use HasFactory;

    protected $fillable = ['user_id','folder_id','title','path','published_for_agents','published_for_clients'];
    protected $guarded = [];   

    // app/Models/ResourceDocument.php
public function getUrlAttribute(): string|null
{
    return $this->path ? Storage::url($this->path) : null;
}


    // relationships, casts, etc…
    public function uploader()
{
    return $this->belongsTo(\App\Models\User::class, 'user_id');
}
}
