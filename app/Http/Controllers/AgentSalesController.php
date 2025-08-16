<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use App\Models\Sale;
use App\Models\Client;
use App\Models\Carrier;
use App\Models\User;
use App\Notifications\SaleCreated;

class AgentSalesController extends Controller
{
    /**
     * Sales index.
     * - If the request wants JSON (Accept: application/json), return a compact JSON list of *all* sales
     *   for this agent (suitable for SalesProgressShelf).
     * - Otherwise render the existing Inertia page with filters/pagination (unchanged).
     */
    public function index(Request $request)
    {
        $agent = auth()->user()->agent;

        /* ---------- JSON for components (SalesProgressShelf) ---------- */
        if ($request->expectsJson() || $request->wantsJson() ||
            str_contains((string) $request->header('Accept'), 'application/json')) {

            // Left join sale_checklists to expose progress_cached without needing model changes.
            $rows = Sale::query()
                ->where('agent_id', $agent->agent_id)
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
        /* -------------------------------------------------------------- */

        // Existing Inertia page logic (unchanged)
        $query = Sale::with(['client', 'carrierInfo'])
                     ->where('agent_id', $agent->agent_id);

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

        $sales = $query->orderBy('sale_date', 'desc')
                       ->paginate(10)
                       ->withQueryString();

        $stats = [
            'totalSales' => $sales->total(),
            'pending'    => $sales->where('status', 'Pending')->count(),
            'completed'  => $sales->where('status', 'Completed')->count(),
        ];

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

        $clients = Client::where('agent_id', $agent->agent_id)
                         ->select('client_id as id','firstname','lastname')
                         ->get();

        // keep your existing status list
        $statuses = [
            'Waiting for Funds','Waiting for Documents','Processing',
            'Waiting for Carrier','Completed','Cancelled',
        ];

        // Leave product options as-is for now (you can swap this to a dynamic list later if you want)
        $products = [
            'trust','precious_metals','term_life',
            'iul','whole_life','annuity',
            'final_expense','10_term','20_term','30_term'
        ];

        return Inertia::render('agent/add-sale', [
            'clients'  => $clients,
            'products' => $products,
            'statuses' => $statuses,
        ]);
    }

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

        $admins = User::where('role','admin')->get();
        Notification::send($admins, new SaleCreated($sale));

        return redirect()
            ->route('agent.sales')
            ->with('success','Sale created and admins notified.');
    }

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
