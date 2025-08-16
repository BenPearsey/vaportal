<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistStage extends Model
{
    protected $fillable = ['template_id','key','label','order','weight'];
    public function template() { return $this->belongsTo(ChecklistTemplate::class, 'template_id'); }
    public function tasks()    { return $this->hasMany(ChecklistTask::class, 'stage_id'); }
}
