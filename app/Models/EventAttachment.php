<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAttachment extends Model
{
    protected $fillable = [
        'event_id','disk','path','original_name','size','uploaded_by',
    ];

    protected $appends = ['download_url'];

    public function event()   { return $this->belongsTo(Event::class); }
    public function uploader(){ return $this->belongsTo(User::class,'uploaded_by'); }

    /** link to controller download (works for local/private disks) */
    public function getDownloadUrlAttribute(): string
    {
        return route('admin.events.attachments.download', [
            'event'      => $this->event_id,
            'attachment' => $this->id,
        ]);
    }
}
