<?php

namespace App\Http\Controllers;

use App\Models\ClientUpdateRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientUpdateRequestController extends Controller
{
    /**
     * Show a list of pending client-info update requests.
     */
    public function index()
    {
        $requests = ClientUpdateRequest::with(['client', 'agent'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/client-update-requests', [
            'updateRequests' => $requests,
        ]);
    }

    /**
     * Approve a pending update request: apply its payload to the client,
     * then mark the request as approved.
     */
    public function approve(ClientUpdateRequest $updateRequest)
    {
        // 1) apply the changes to the client
        $updateRequest->client->update($updateRequest->payload);

        // 2) mark this request approved
        $updateRequest->update(['status' => 'approved']);

        return redirect()
            ->route('admin.client_update_requests.index')
            ->with('success', 'Client update approved and applied.');
    }

    /**
     * Reject a pending update request.
     */
    public function reject(ClientUpdateRequest $updateRequest)
    {
        $updateRequest->update(['status' => 'rejected']);

        return redirect()
            ->route('admin.client_update_requests.index')
            ->with('success', 'Client update request rejected.');
    }
}
