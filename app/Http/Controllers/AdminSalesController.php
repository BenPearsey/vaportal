<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Client;
use App\Models\Agent;
use App\Models\Carrier;
use Inertia\Inertia;

class AdminSalesController extends Controller
{
    /**
     * Show Add Sale Page (GET /admin/sales/create)
     */
    public function create()
    {
        $agents  = Agent::select('agent_id as id', 'firstname', 'lastname')->get();
        $clients = Client::select('client_id as id', 'firstname', 'lastname')->get();

        return Inertia::render('admin/add-sale', [
            'agents'  => $agents,
            'clients' => $clients,
        ]);
    }

    /**
     * Handle Sale Submission (POST /admin/sales/store)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id'          => 'required|exists:agents,agent_id',
            'client_id'         => 'required|exists:clients,client_id',
            'product'           => 'required|string|max:255',
            'carrier'           => 'nullable|numeric|exists:carriers,id',
            'total_sale_amount' => 'required|numeric',
            'commission'        => 'required|numeric',
            'sale_date'         => 'required|date',
            'status'            => 'required|in:Waiting for Funds,Waiting for Documents,Processing,Waiting for Carrier,Completed,Cancelled',
        ]);

          /* ---------- DEFAULT CHECKLIST ITEMS ---------- */
$defaultChecklist = [
    ['label' => 'Application received from client',   'done' => false],
    ['label' => 'Client ID / KYC verified',           'done' => false],
    ['label' => 'All paperwork uploaded to portal',   'done' => false],
    ['label' => 'Initial funds received & reconciled','done' => false],
    ['label' => 'Submission package sent to carrier', 'done' => false],
    ['label' => 'Policy / contract issued',           'done' => false],
];
    /* --------------------------------------------- */

        Sale::create([
            'agent_id'          => $validated['agent_id'],
            'client_id'         => $validated['client_id'],
            'product'           => $validated['product'],
            'carrier_id'        => $validated['carrier'] ?? null,
            'total_sale_amount' => $validated['total_sale_amount'],
            'commission'        => (float)$validated['commission'],
            'sale_date'         => $validated['sale_date'],
            'status'            => $validated['status'],
            'funds_received'    => 0,
            'checklist'         => $defaultChecklist,          // ← NEW

        ]);

        return redirect()->route('admin.sales')->with('success', 'Sale added successfully!');
    }

    public function show(Sale $sale)
    {
        // eager load relations
        $sale->load(['agent','client','carrierInfo',]);
        $sale->product = ucfirst(str_replace('_',' ',$sale->product));

        return Inertia::render('admin/sale-overview', [
            'sale' => [
                'sale_id'          => $sale->sale_id,
                'agent'            => ['id' => $sale->agent->agent_id, 'firstname' => $sale->agent->firstname, 'lastname' => $sale->agent->lastname],
                'client'           => ['id' => $sale->client->client_id, 'firstname' => $sale->client->firstname, 'lastname' => $sale->client->lastname, 'email' => $sale->client->email, 'phone' => $sale->client->phone],
                'carrier_info'     => $sale->carrierInfo ? ['id' => $sale->carrierInfo->id, 'name' => $sale->carrierInfo->name] : null,
                'product'          => $sale->product,
                'total_sale_amount'=> $sale->total_sale_amount,
                'commission'       => $sale->commission,
                'status'           => $sale->status,
                'sale_date'        => $sale->sale_date,
                'checklist' => $sale->checklist,
            ],

             /* new ↓ – guaranteed arrays */
        'documents' => $sale->documents
            ->map(fn ($d) => [
                'id'    => $d->id,
                'title' => $d->title,
                'path'  => $d->path,
            ])
            ->values(),

        'notes' => $sale->notes
            ->map(fn ($n) => [
                'id'         => $n->id,
                'content'    => $n->content,
                'created_at' => $n->created_at->toDateTimeString(),
                'created_by' => $n->created_by,
            ])
            ->values(),
    ]);
        
    }

    /* ─────────────── Toggle checklist item ─────────────── */
    public function updateChecklist(Request $r, Sale $sale)
    {
        $data = $r->validate([
            'index' => 'required|integer|min:0',
            'done'  => 'required|boolean',
        ]);

        $list = $sale->checklist ?? [];
        if (! isset($list[$data['index']])) {
            return response()->json(['error' => 'Item not found.'], 404);
        }

        $list[$data['index']]['done'] = $data['done'];
        $sale->checklist = $list;
        $sale->save();

        return response()->noContent();
    }

    /**
     * Show the edit form.
     */
    public function edit(Sale $sale)
    {
        $sale->load(['carrierInfo']);
        $agents   = Agent::select('agent_id as id','firstname','lastname')->get();
        $clients  = Client::select('client_id as id','firstname','lastname')->get();
        $carriers = Carrier::select('id','name')->get();
        $products = ['trust','precious_metals','term_life','iul','whole_life','annuity','final_expense','10_term','20_term','30_term'];
        $statuses = ['Waiting for Funds','Waiting for Documents','Processing','Waiting for Carrier','Completed','Cancelled'];

        return Inertia::render('admin/edit-sale', [
            'sale'     => [
                'sale_id'          => $sale->sale_id,
                'agent_id'         => $sale->agent_id,
                'client_id'        => $sale->client_id,
                'carrier_info'     => $sale->carrierInfo ? ['id' => $sale->carrierInfo->id] : null,
                'product'          => $sale->product,
                'total_sale_amount'=> $sale->total_sale_amount,
                'commission'       => $sale->commission,
                'status'           => $sale->status,
                'sale_date'        => $sale->sale_date,
            ],
            'agents'   => $agents,
            'clients'  => $clients,
            'carriers' => $carriers,
            'products' => $products,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Handle the update.
     */
    public function update(Request $request, Sale $sale)
    {
        $data = $request->validate([
            'agent_id'          => 'required|exists:agents,agent_id',
            'client_id'         => 'required|exists:clients,client_id',
            'product'           => 'required|string',
            'carrier'           => 'nullable|exists:carriers,id',
            'total_sale_amount' => 'required|numeric',
            'commission'        => 'required|numeric',
            'sale_date'         => 'required|date',
            'status'            => 'required|in:Waiting for Funds,Waiting for Documents,Processing,Waiting for Carrier,Completed,Cancelled',
        ]);

        $sale->update([
            'agent_id'          => $data['agent_id'],
            'client_id'         => $data['client_id'],
            'product'           => $data['product'],
            'carrier_id'        => $data['carrier'] ?? null,
            'total_sale_amount' => $data['total_sale_amount'],
            'commission'        => $data['commission'],
            'sale_date'         => $data['sale_date'],
            'status'            => $data['status'],
        ]);

        return redirect()->route('admin.sales.show', $sale->sale_id)
                         ->with('success','Sale updated.');
    }

       /* ─────────────── Destroy (DELETE) ───────────── */
       public function destroy(Sale $sale)
       {
           $sale->delete();
   
           return redirect()->route('admin.sales')
                            ->with('success', 'Sale deleted.');
       }
}