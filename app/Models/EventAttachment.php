<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EventAttachment extends Model
{
    protected $fillable = [
        'event_id', 'disk', 'path', 'original_name', 'size', 'uploaded_by',
    ];

    /* ───── relations ───── */
    public function event()   : BelongsTo { return $this->belongsTo(Event::class); }
    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }

    /* ───── attributes ───── */

    /**  path relative to the disk root (works with attachFromStorageDisk) */
    public function getRelativePathAttribute(): string
    {
        // if “path” already *is* relative nothing changes
        $abs = storage_path('app/');
        return ltrim(str_replace($abs, '', $this->path), '/');
    }

    /** 30-min signed download URL */
    public function getDownloadUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->relative_path);
    }
}
