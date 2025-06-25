<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Announcement;
use App\Models\Sale;
use App\Models\Client;

class AdminDashboardController extends Controller
{
    public function dashboard()
{
    // Retrieve announcements sorted by created_at
    $announcements = Announcement::orderBy('created_at', 'desc')
        ->take(3)
        ->get();

    $sales = Sale::all();
    $clients = Client::all();

    return Inertia::render('admin/dashboard', [
        'announcements' => $announcements,
        'sales'         => $sales,
        'clients'       => $clients,
    ]);
}

}
