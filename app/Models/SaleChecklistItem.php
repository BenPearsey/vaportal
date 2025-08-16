<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleChecklistItem extends Model
{
    protected $fillable = [
        'sale_checklist_id','task_id','parent_item_id','assignee_type','assignee_id',
        'state','due_at','started_at','completed_at','blocked_reason','notes','meta'
    ];

    protected $casts = [
        'due_at'      => 'datetime',
        'started_at'  => 'datetime',
        'completed_at'=> 'datetime',
        'meta'        => 'array',
    ];

    public function saleChecklist() { return $this->belongsTo(SaleChecklist::class, 'sale_checklist_id'); }
    public function task()          { return $this->belongsTo(ChecklistTask::class, 'task_id'); }
    public function links()         { return $this->hasMany(SaleChecklistItemLink::class, 'checklist_item_id'); }
}
