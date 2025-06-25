<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Inertia\Inertia;

class ClientSaleController extends Controller
{
    public function show(Sale $sale)
    {
        // Make sure this sale belongs to the logged-in client
        abort_unless(
            $sale->client_id === auth()->user()->client->client_id,
            403
        );

        return Inertia::render('client/sale-overview', [
            'sale'   => $sale->load('agent'),          // pull what you need
        ]);
    }
}
