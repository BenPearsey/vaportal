<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleChecklist extends Model
{
    protected $fillable = ['sale_id','template_id','template_version','status','progress_cached'];
    public function sale()  { return $this->belongsTo(Sale::class, 'sale_id', 'sale_id'); }
    public function items() { return $this->hasMany(SaleChecklistItem::class, 'sale_checklist_id'); }
    public function template() { return $this->belongsTo(ChecklistTemplate::class, 'template_id'); }
}
