<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientSaleController extends Controller
{
    /**
     * JSON list of all sales for the logged-in client (for SalesProgressShelf).
     */
    public function index(Request $request)
    {
        $client = $request->user()->client;

        $rows = Sale::query()
            ->where('client_id', $client->client_id)
            ->leftJoin('sale_checklists as sc', 'sc.sale_id', '=', 'sales.sale_id')
            ->orderByDesc('sale_date')
            ->get([
                'sales.sale_id as id',
                'sales.product',
                'sales.created_at',
                'sales.sale_date as contracted_at',
                'sales.status',
                'sc.progress_cached',
            ]);

        return response()->json($rows);
    }

    public function show(Sale $sale)
    {
        abort_unless(
            $sale->client_id === auth()->user()->client->client_id,
            403
        );

        return Inertia::render('client/sale-overview', [
            'sale' => $sale->load('agent'),
        ]);
    }
}
