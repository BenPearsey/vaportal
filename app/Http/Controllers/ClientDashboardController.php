<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Announcement;
use App\Models\Sale;
use Carbon\Carbon;


class ClientDashboardController extends Controller
{
    public function dashboard()
    {
        /** @var \App\Models\Client $client */
        $client = auth()->user()->client;

        // ───────── Announcements (latest 3) ─────────
        $announcements = Announcement::latest()->take(3)->get();

        // ───────── Client’s products / sales ─────────
        $products = Sale::where('client_id', $client->client_id)
                        ->with('agent:agent_id,firstname,lastname,phone,email')   // for table + contact card
                        ->get();

        // ───────── Annual index-reallocation reminder ─────────
        // show items whose 1-year anniversary is 60-90 days away
        $today = Carbon::today();
        $alerts = $products->filter(function ($sale) use ($today) {
            if (!$sale->issue_date) return false;
            $anniv = Carbon::parse($sale->issue_date)->addYear();
            $days  = $today->diffInDays($anniv, false);
            return $days <= 90 && $days >= 60;
        })->values()->map(function ($sale) {
            return [
                'sale_id'     => $sale->sale_id,
                'product'     => $sale->product,
                'anniversary' => Carbon::parse($sale->issue_date)->addYear()->toDateString(),
            ];
        });

        return Inertia::render('client/dashboard', [
            'announcements' => $announcements,
            'products'      => $products,
            'alerts'        => $alerts,
            'agent'         => $client->agent   // single agent for contact card
        ]);
    }
}
