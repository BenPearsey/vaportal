<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistTask extends Model
{
    protected $fillable = [
        'stage_id','key','label','role_scope','visibility','action_type',
        'requires_review','is_repeatable','repeat_group','dependencies',
        'default_due_days','evidence_required','metadata'
    ];

    protected $casts = [
        'dependencies' => 'array',
        'metadata'     => 'array',
        'requires_review' => 'boolean',
        'is_repeatable'   => 'boolean',
        'evidence_required' => 'boolean',
    ];

    public function stage() { return $this->belongsTo(ChecklistStage::class, 'stage_id'); }
}
