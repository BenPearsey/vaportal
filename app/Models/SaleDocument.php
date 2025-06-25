<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleDocument extends Model
{
    use HasFactory;

    // table name is the plural default (“sale_documents”), so no need for protected $table

    /** Mass‑assignable columns */
    protected $fillable = [
        'sale_id',
        'title',
        'path',
    ];

    /*  Relationship back to the parent sale.
        - local key:   sale_id  (column on this table)
        - parent key:  sale_id  (primary key on sales) */
    public function sale()
    {
        return $this->belongsTo(Sale::class, 'sale_id', 'sale_id');
    }
}
