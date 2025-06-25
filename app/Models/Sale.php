<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Agent;
use App\Models\Client;
use App\Models\Carrier;

class Sale extends Model
{
    use HasFactory;

    protected $primaryKey = 'sale_id';

    protected $fillable = [
        'client_id',
        'agent_id',
        'product',           // Used for sale type (we use a mapping on the front end)
        'total_sale_amount',
        'commission',
        'carrier_id',        // This column stores the carrier's ID
        'status',
        'sale_date',
        'funds_received',
        'sale_type',
        'checklist',         // This column stores the checklist items as JSON
    ];

    // app/Models/Sale.php
protected $casts = [
    'checklist' => 'array',
];



    public function agent()
    {
        // Assuming agent details are stored in the Agent model.
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function carrierInfo()
    {
        // This relationship uses the sale table's carrier_id to relate to Carrier's id.
        return $this->belongsTo(Carrier::class, 'carrier_id');
    }

    public function documents()
{
    // local key on sale_documents = sale_id, parent key on sales = sale_id
    return $this->hasMany(SaleDocument::class, 'sale_id', 'sale_id');
}

public function notes()
{
    return $this->hasMany(SaleNote::class, 'sale_id', 'sale_id');
}

// app/Models/Sale.php
public function checklist()
{
    return $this->hasMany(SaleChecklistItem::class, 'sale_id', 'sale_id');
}

}
