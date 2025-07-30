<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Event extends Model
{
    protected $fillable = [
        'title', 'description', 'start_datetime', 'end_datetime',
        'all_day', 'owner_id',
        'activity_type', 'status',
        'recurrence_rule', 'recurrence_exceptions', 'is_private',
        'priority','location','reminder_minutes',
    ];

    protected $casts = [
        'all_day'               => 'boolean',
        'start_datetime'        => 'datetime',
        'end_datetime'          => 'datetime',
        'is_private'            => 'boolean',
        'recurrence_exceptions' => 'array',
        'reminder_minutes' => 'integer',
    ];

    /* ---------------------------------------------------- relations */

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**  Portal users invited to this event */
    public function userParticipants(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'event_participants',
            'event_id',
            'user_id'
        )->withPivot('status')->withTimestamps();
    }

    /**  External contacts invited to this event */
    public function contactParticipants(): BelongsToMany
    {
        return $this->belongsToMany(
            Contact::class,
            'event_participants',
            'event_id',
            'contact_id'
        )->withPivot('status')->withTimestamps();
    }
}
