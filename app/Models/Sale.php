<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Agent;
use App\Models\Client;
use App\Models\Carrier;
use App\Models\SaleChecklist;
use App\Models\SaleChecklistItem;

class Sale extends Model
{
    use HasFactory;

    protected $primaryKey = 'sale_id';

    protected $fillable = [
        'client_id',
        'agent_id',
        'product',            // Used for sale type (mapped on the FE)
        'total_sale_amount',
        'commission',
        'carrier_id',
        'status',
        'sale_date',
        'funds_received',
        'sale_type',
        'checklist',          // legacy JSON column
    ];

    protected $casts = [
        'checklist' => 'array',
    ];

    /* ---------------- Relations ---------------- */

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function carrierInfo()
    {
        return $this->belongsTo(Carrier::class, 'carrier_id');
    }

    public function documents()
    {
        return $this->hasMany(SaleDocument::class, 'sale_id', 'sale_id');
    }

    public function notes()
    {
        return $this->hasMany(SaleNote::class, 'sale_id', 'sale_id');
    }

    /**
     * ✅ The parent checklist row for this sale (holds progress_cached).
     * Matches SaleChecklistController which looks up by sale_id.
     */
    public function checklistParent()
    {
        return $this->hasOne(SaleChecklist::class, 'sale_id', 'sale_id');
    }

    /**
     * Optional helper: all checklist items for this sale via the parent.
     * Not required for the dashboards, but handy if you need items.
     */
    public function checklistItemsThrough()
    {
        return $this->hasManyThrough(
            SaleChecklistItem::class, // final
            SaleChecklist::class,     // through
            'sale_id',                // FK on SaleChecklist referencing sales.sale_id
            'sale_checklist_id',      // FK on SaleChecklistItem referencing sale_checklists.id
            'sale_id',                // local key on sales
            'id'                      // local key on sale_checklists
        );
    }

    /**
     * ⚠ NOTE: You already had a method named "checklist()" and also a JSON attribute
     * "checklist" (cast above). Leaving it as-is to avoid breaking anything,
     * but be aware the name collision can be confusing. Prefer checklistParent()
     * or checklistItemsThrough() going forward.
     */
    public function checklist()
    {
        // Your original relation was here; leaving as-is for compatibility.
        // It likely doesn't match your DB columns for items, so avoid using it.
        return $this->hasMany(SaleChecklistItem::class, 'sale_id', 'sale_id');
    }
}
