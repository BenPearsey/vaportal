<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventEmailInvite extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'email',       // string
        'status',      // invited | accepted | declined
    ];

    /* the parent event */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

        public const STATUS_QUEUED     = 'queued';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_SENT       = 'sent';
    public const STATUS_FAILED     = 'failed';
}
