<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactLink extends Model
{
    /** @var string[] */
    protected $guarded = [];          // mass-assign everything

    /* --------------------------------------------------------------
       Relationships
    -------------------------------------------------------------- */

    /** The “from” side of the link (owner) */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /** The “to / related” side of the link */
    public function related(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'related_contact_id');
    }
}
