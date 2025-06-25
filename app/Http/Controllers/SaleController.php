<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Client;
use App\Models\Carrier;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    public function adminSales()
    {
        // Eager-load agent, client, and carrierInfo relationships.
        $sales = Sale::with(['agent', 'client', 'carrierInfo'])->get();
        return Inertia::render('admin/sales', [
            'sales' => $sales,
        ]);
    }

    public function agentSales()
    {
        $agentId = Auth::id();
        $sales = Sale::where('agent_id', $agentId)
            ->with(['client', 'carrierInfo'])
            ->get();
        return Inertia::render('agent/sales', [
            'sales' => $sales,
        ]);
    }

    public function getCarriers(Request $request)
    {
        $product = $request->query('product');
        if (!$product) {
            return response()->json([]);
        }
        
        $carrierIds = \DB::table('carrier_product')
            ->whereRaw('LOWER(product) = ?', [strtolower($product)])
            ->pluck('carrier_id');
        
        $carriers = Carrier::whereIn('id', $carrierIds)->get();
        return response()->json($carriers);
    }
}
