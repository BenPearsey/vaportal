<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChecklistTemplate extends Model
{
    protected $fillable = ['product','version','title','status','created_by'];
    public function stages() { return $this->hasMany(ChecklistStage::class, 'template_id'); }
}
