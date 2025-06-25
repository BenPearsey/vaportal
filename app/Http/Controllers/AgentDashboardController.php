<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Announcement;
use App\Models\Sale;
use App\Models\Client;

class AgentDashboardController extends Controller
{
    public function dashboard()
    {
        // 1. Get the currently logged in user’s Agent record
        //    (assuming each User has exactly one Agent instance).
        $agent = auth()->user()->agent;

        // 2. Retrieve the top 3 announcements, sorted by latest creation date
        $announcements = Announcement::orderBy('created_at', 'desc')
            ->take(3)
            ->get();

        // 3. Retrieve all sales for this specific agent
        //    so that the agent only sees their own sales.
        $sales = Sale::where('agent_id', $agent->agent_id)->get();

        // 4. Retrieve all clients for this agent
        $clients = Client::where('agent_id', $agent->agent_id)->get();

        // ----------------------------------------
        //    EXAMPLE STATS CALCULATIONS
        // ----------------------------------------

        // 4a. Count pending sales (i.e. not Completed, Matured, or Cancelled)
        $pendingSales = $sales->filter(function ($sale) {
            return ! in_array($sale->status, ['Completed', 'Matured', 'Cancelled']);
        })->count();

        // Gather current time info
        $now          = now();
        $currentYear  = $now->year;
        $currentMonth = $now->month;

        // 4b. Sales completed this month
        $salesCompletedThisMonth = $sales->filter(function ($sale) use ($currentYear, $currentMonth) {
            if ($sale->status !== 'Completed') {
                return false;
            }
            $saleDate = \Carbon\Carbon::parse($sale->sale_date);
            return $saleDate->year === $currentYear && $saleDate->month === $currentMonth;
        })->count();

        // 4c. Sales completed this year
        $salesCompletedYear = $sales->filter(function ($sale) use ($currentYear) {
            if ($sale->status !== 'Completed') {
                return false;
            }
            $saleDate = \Carbon\Carbon::parse($sale->sale_date);
            return $saleDate->year === $currentYear;
        })->count();

        // 4d. New clients for this year who have at least one Completed sale
        //     This logic is often business-specific, so feel free to adapt as needed.
        $newClientsCurrentYear = $clients->filter(function ($client) use ($currentYear) {
            $createdYear = \Carbon\Carbon::parse($client->created_at)->year;
            if ($createdYear !== $currentYear) {
                return false;
            }
            // Check if the client has at least one completed sale
            return $client->sales->contains(function ($sale) {
                return $sale->status === 'Completed';
            });
        })->count();

        // 5. Prepare whatever extra data or progress info you want
        //    For example, you might want to generate a "sales progress" array:
        //    (If you don’t have a real progress metric, you could stub it out or omit it.)
        $salesProgress = $sales->take(5)->map(function ($sale) {
            // Basic placeholder: random progress or some custom logic
            $randomProgress = random_int(20, 90);
            return [
                'id'      => $sale->sale_id,
                'name'    => optional($sale->client)->firstname.' '.optional($sale->client)->lastname,
                'progress'=> $randomProgress
            ];
        })->values();

        // 6. Return the Inertia page, passing all relevant data.
        return Inertia::render('agent/dashboard', [
            'announcements'             => $announcements,
            'pendingSales'              => $pendingSales,
            'salesCompletedThisMonth'   => $salesCompletedThisMonth,
            'salesCompletedYear'        => $salesCompletedYear,
            'newClientsCurrentYear'     => $newClientsCurrentYear,
            'salesProgress'             => $salesProgress,
        ]);
    }
}
