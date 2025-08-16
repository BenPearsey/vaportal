<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleChecklistItemLink extends Model
{
    protected $fillable = ['checklist_item_id','document_model','document_id','review_state','reviewed_by','review_note'];
    public function item() { return $this->belongsTo(SaleChecklistItem::class, 'checklist_item_id'); }
}
