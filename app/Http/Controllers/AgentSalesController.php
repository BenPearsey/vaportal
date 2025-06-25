<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;                // ← for Auth::user()
use Illuminate\Support\Facades\Notification;        // ← for sending notifications
use App\Models\Sale;
use App\Models\Client;                              // ← your agent’s clients
use App\Models\Carrier;
use App\Models\User;                                // ← to look up admins
use App\Notifications\SaleCreated;                  // ← your new notification

class AgentSalesController extends Controller
{
    /**
     * Display a paginated list of this agent's sales,
     * with filters for status, product & carrier.
     */
    public function index(Request $request)
    {
        $agent = auth()->user()->agent;

        // Base query: only this agent's sales, eager-loading client & carrierInfo
        $query = Sale::with(['client', 'carrierInfo'])
                     ->where('agent_id', $agent->agent_id);

        // Apply filters
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->filled('product') && $request->product !== 'All') {
            $query->where('product', $request->product);
        }
        if ($request->filled('carrier') && $request->carrier !== 'All') {
            $query->where('carrier_id', $request->carrier);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('client', function($q) use ($search) {
                $q->whereRaw("CONCAT(firstname, ' ', lastname) LIKE ?", ["%{$search}%"]);
            });
        }

        // Paginate
        $sales = $query->orderBy('sale_date', 'desc')
                       ->paginate(10)
                       ->withQueryString();

        // Summary stats
        $stats = [
            'totalSales' => $sales->total(),
            'pending'    => $sales->where('status', 'Pending')->count(),
            'completed'  => $sales->where('status', 'Completed')->count(),
        ];

        // Filters: status, distinct products, and carriers
        $statuses = Sale::select('status')->distinct()->pluck('status')->prepend('All');
        $products = Sale::select('product')->distinct()->pluck('product')->prepend('All');
        $carriers = Carrier::select('id','name')
                            ->orderBy('name')
                            ->get()
                            ->map(fn($c) => ['id' => $c->id, 'name' => $c->name])
                            ->prepend(['id' => 'All', 'name' => 'All']);

        return Inertia::render('agent/sales', [
            'sales'    => $sales,
            'stats'    => $stats,
            'filters'  => [
                'statuses' => $statuses,
                'products' => $products,
                'carriers' => $carriers,
            ],
            'selected' => $request->only(['status','product','carrier','search']),
        ]);
    }

    public function create()
    {
        $agent = Auth::user()->agent;

        // only this agent’s clients
        $clients = Client::where('agent_id', $agent->agent_id)
                         ->select('client_id as id','firstname','lastname')
                         ->get();

        // mirror your admin products list
        $products = [
            'trust','precious_metals','term_life',
            'iul','whole_life','annuity',
            'final_expense','10_term','20_term','30_term'
        ];

        // mirror your admin statuses
        $statuses = [
            'Waiting for Funds','Waiting for Documents','Processing',
            'Waiting for Carrier','Completed','Cancelled',
        ];

        return Inertia::render('agent/add-sale', [
            'clients'  => $clients,
            'products' => $products,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Persist a new Sale and notify all admins.
     */
    public function store(Request $request)
    {
        $agent = Auth::user()->agent;

        $validated = $request->validate([
            'client_id'         => 'required|exists:clients,client_id',
            'product'           => 'required|string',
            'carrier'           => 'nullable|exists:carriers,id',
            'total_sale_amount' => 'required|numeric',
            'commission'        => 'required|numeric',
            'sale_date'         => 'required|date',
            'status'            => 'required|in:Waiting for Funds,Waiting for Documents,Processing,Waiting for Carrier,Completed,Cancelled',
        ]);

        $sale = Sale::create([
            'agent_id'          => $agent->agent_id,
            'client_id'         => $validated['client_id'],
            'product'           => $validated['product'],
            'carrier_id'        => $validated['carrier'] ?? null,
            'total_sale_amount' => $validated['total_sale_amount'],
            'commission'        => (float)$validated['commission'],
            'sale_date'         => $validated['sale_date'],
            'status'            => $validated['status'],
            'funds_received'    => 0,
        ]);

        // notify all admins
        $admins = User::where('role','admin')->get();
        Notification::send($admins, new SaleCreated($sale));

        return redirect()
            ->route('agent.sales')
            ->with('success','Sale created and admins notified.');
    }

    /**
     * Show a single sale’s details.
     */
    public function show(Sale $sale)
    {
        $agent = auth()->user()->agent;
        abort_unless($sale->agent_id === $agent->agent_id, 403);

        $sale->load(['client','carrierInfo']);

        return Inertia::render('agent/sale-overview', [
            'sale' => $sale,
        ]);
    }
}
