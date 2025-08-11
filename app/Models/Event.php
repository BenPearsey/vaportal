<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    /* ------------------------------------------------ fillables / casts */
    protected $fillable = [
        'owner_id', 'title', 'description',
        'start_datetime', 'end_datetime', 'all_day',
        'activity_type', 'status',
        'recurrence_rule', 'recurrence_exceptions',
        'is_private', 'priority',
        'location', 'reminder_minutes',
    ];

    protected $casts = [
        'all_day'           => 'bool',
        'start_datetime'    => 'datetime',
        'end_datetime'      => 'datetime',
        'recurrence_exceptions' => 'array',
    ];

    /* ------------------------------------------------ relationships */

    /** owner (admin or agent) */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** many-to-many → users invited */
    public function userParticipants()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('status')
                    ->withTimestamps();
    }

    /** many-to-many → contacts invited */
    public function contactParticipants()
    {
    return $this->belongsToMany(
        Contact::class,         // related model
        'event_contact'         // <-- pivot table name
    )->withPivot('status')->withTimestamps();
    }

    /** attachments */
    public function attachments()
    {
        return $this->hasMany(EventAttachment::class);
    }

    /** ← NEW  free-typed e-mail invitees  */
    public function emailInvites()
    {
        return $this->hasMany(EventEmailInvite::class);
    }

    
}
