<?php

namespace App\Http\Controllers;

use App\Models\ChecklistTemplate;
use App\Models\ChecklistTask;
use App\Models\Sale;
use App\Models\SaleChecklist;
use App\Models\SaleChecklistItem;
use App\Models\SaleChecklistItemLink;
use App\Models\SaleDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/* notifications + helper */
use App\Support\ChecklistSignals;
use App\Notifications\AdminChecklistUpdate;
use App\Notifications\ClientActionRequired;
use App\Notifications\ClientMilestone;
use App\Notifications\SaleCompletedNotification;

class SaleChecklistController extends Controller
{
    /* =========================================================
       Guards / helpers
       ========================================================= */

    protected function ensureRoleCanAccessSale(Request $r, Sale $sale, string $role): void
    {
        if ($role === 'admin') return;

        if ($role === 'agent') {
            $agent = $r->user()?->agent;
            abort_unless($agent && (int) $sale->agent_id === (int) $agent->agent_id, 403);
            return;
        }

        if ($role === 'client') {
            $client = $r->user()?->client;
            abort_unless($client && (int) $sale->client_id === (int) $client->client_id, 403);
            return;
        }

        abort(403);
    }

    /** Map DB states → compact UI states expected by the panel. */
    protected function uiState(string $state): string
    {
        return match ($state) {
            'not_started', 'in_progress', 'waiting_on_client', 'uploaded', 'blocked' => 'todo',
            'pending_review'   => 'pending_review',
            'approved'         => 'approved',
            'rejected'         => 'rejected',
            'complete'         => 'complete',
            'na'               => 'na',
            default            => 'todo',
        };
    }

    /** Map UI state → DB state. */
    protected function dbState(string $ui): string
    {
        return match ($ui) {
            'todo'            => 'not_started',
            'pending_review'  => 'pending_review',
            'approved'        => 'approved',
            'rejected'        => 'rejected',
            'complete'        => 'complete',
            'na'              => 'na',
            default           => 'not_started',
        };
    }

    /** Done states for progress. */
    protected function isDone(string $state): bool
    {
        return in_array($state, ['approved', 'complete'], true);
    }

    protected function computeProgress(SaleChecklist $sc): int
    {
        $items = $sc->items()->with('task.stage')->get();

        $byStage = [];
        foreach ($items as $it) {
            $stageId = $it->task->stage->id;
            $weight  = (int) ($it->task->stage->weight ?? 0);

            $byStage[$stageId] ??= ['weight' => $weight, 'done' => 0, 'total' => 0];
            if ($it->state !== 'na') {
                $byStage[$stageId]['total']++;
                if ($this->isDone($it->state)) {
                    $byStage[$stageId]['done']++;
                }
            }
        }

        $totalWeight = array_sum(array_column($byStage, 'weight')) ?: 1;
        $accum = 0;
        foreach ($byStage as $stage) {
            $pct = $stage['total'] ? ($stage['done'] / $stage['total']) : 0;
            $accum += $pct * $stage['weight'];
        }

        return (int) round(($accum / $totalWeight) * 100);
    }

    protected function checklistForSaleOrFail(Sale $sale): SaleChecklist
    {
        return SaleChecklist::where('sale_id', $sale->sale_id)->firstOrFail();
    }

    protected function assertItemBelongsToSale(Sale $sale, SaleChecklistItem $item): void
    {
        $scId = SaleChecklist::where('sale_id', $sale->sale_id)->value('id');
        abort_unless($scId && (int) $item->sale_checklist_id === (int) $scId, 404);
    }

    /** Notify admins (DB + mail) about a checklist event. */
    protected function notifyAdmins(Sale $sale, string $event, ?SaleChecklistItem $item = null, array $meta = []): void
    {
        $admins = User::where('role', 'admin')->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new AdminChecklistUpdate($sale, $event, $item, $meta));
        }
    }

    /** If progress just hit 100 or sale already flagged Completed, notify all parties. */
    protected function notifySaleCompletedIfNeeded(SaleChecklist $sc, Sale $sale, int $beforeProgress, int $afterProgress): void
    {
        $hitChecklistDone = ($beforeProgress < 100 && $afterProgress >= 100);
        $explicitComplete = ($sale->status === 'Completed');

        if (! $hitChecklistDone && ! $explicitComplete) {
            return;
        }

        $targets = collect([
            $sale->client?->user,
            $sale->agent?->user,
        ])->filter();

        $admins = User::where('role', 'admin')->get();
        $targets = $targets->merge($admins)->filter();

        if ($targets->isNotEmpty()) {
            Notification::send($targets, new SaleCompletedNotification($sale));
        }
    }

    /* =========================================================
       Instantiate (Trust only for now)
       ========================================================= */

    public function ensure(Request $r, Sale $sale)
    {
        $role = $r->route('role') ?? 'admin';
        $this->ensureRoleCanAccessSale($r, $sale, $role);

        $p = strtolower((string) $sale->product);
        if (! str_contains($p, 'trust')) {
            return response()->json(['message' => 'Checklist is only for Trust product (for now).'], 422);
        }

        $tpl = ChecklistTemplate::where(['product' => 'trust', 'status' => 'active'])
            ->orderByDesc('version')
            ->firstOrFail();

        $sc = SaleChecklist::firstOrCreate(
            ['sale_id' => $sale->sale_id, 'template_id' => $tpl->id],
            ['template_version' => $tpl->version, 'status' => 'active']
        );

        if ($sc->wasRecentlyCreated) {
            DB::transaction(function () use ($sc, $tpl) {
                $taskIds = $tpl->stages()->pluck('id');
                $tasks   = ChecklistTask::whereIn('stage_id', $taskIds)->get();

                $rows = $tasks->map(fn ($t) => [
                    'sale_checklist_id' => $sc->id,
                    'task_id'           => $t->id,
                    'state'             => 'not_started',
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ])->all();

                if ($rows) {
                    SaleChecklistItem::insert($rows);
                }
            });

            $sc->update(['progress_cached' => $this->computeProgress($sc)]);

            // Admins: a checklist has been instantiated
            $this->notifyAdmins($sale, 'checklist_created', null, [
                'template_id' => $sc->template_id,
                'version'     => $sc->template_version,
            ]);
        }

        return $this->summary($r, $sale);
    }

    /* =========================================================
       Summary / Read
       ========================================================= */

    public function summary(Request $r, Sale $sale)
    {
        $role = $r->route('role') ?? 'admin';
        $this->ensureRoleCanAccessSale($r, $sale, $role);

        $sc = SaleChecklist::with([
            'template.stages' => fn ($q) => $q->orderBy('order'),
            'items.task.stage',
            'items.links',
        ])->where('sale_id', $sale->sale_id)->first();

        if (! $sc) {
            return response()->json(['exists' => false, 'message' => 'No checklist yet. Call /ensure to create.']);
        }

        // Gather doc titles in bulk (admin UI convenience)
        $docIds = [];
        foreach ($sc->items as $it) {
            foreach ($it->links as $l) {
                if ($l->document_id) $docIds[] = (int) $l->document_id;
            }
        }
        $docTitles = $docIds
            ? SaleDocument::whereIn('id', array_unique($docIds))->pluck('title', 'id')
            : collect();

        // Role-scoped items
        $items = $sc->items->filter(function ($it) use ($role) {
            $vis = $it->task->visibility ?? 'all';
            if ($role === 'admin') return true;
            if ($role === 'agent') return in_array($vis, ['all', 'agent'], true);
            if ($role === 'client') return in_array($vis, ['all', 'client'], true);
            return false;
        })->values()->map(function ($it) use ($docTitles) {
            return [
                'id'    => $it->id,
                'state' => $this->uiState($it->state),
                'task'  => [
                    'key'             => $it->task->key,
                    'label'           => $it->task->label,
                    'action_type'     => $it->task->action_type,
                    'requires_review' => (bool) $it->task->requires_review,
                    'repeat_group'    => $it->task->repeat_group,
                    'stage'           => [
                        'id'     => $it->task->stage->id,
                        'key'    => $it->task->stage->key,
                        'label'  => $it->task->stage->label,
                        'order'  => (int) $it->task->stage->order,
                        'weight' => (int) $it->task->stage->weight,
                    ],
                ],
                'parent_item_id' => $it->parent_item_id,
                'links' => $it->links->map(function ($l) use ($docTitles) {
                    return [
                        'id'             => $l->id,
                        'review_state'   => $l->review_state,
                        'review_note'    => $l->review_note,
                        'document_id'    => $l->document_id,
                        'document_title' => $l->document_id ? ($docTitles[$l->document_id] ?? null) : null,
                    ];
                })->values(),
            ];
        });

        return response()->json([
            'exists'   => true,
            'progress' => (int) $sc->progress_cached,
            'stages'   => $sc->template->stages->map(fn ($s) => [
                'id'     => $s->id,
                'key'    => $s->key,
                'label'  => $s->label,
                'order'  => (int) $s->order,
                'weight' => (int) $s->weight,
            ])->values(),
            'items'    => $items,

            // metadata used by MiniChecklistWidget for the header
            'sale' => [
                'id'            => (int) $sale->sale_id,
                'number'        => (int) $sale->sale_id,
                'product'       => $sale->product,
                'product_label' => $sale->product, // FE will map via lib/products.ts
                'product_name'  => $sale->product,
                'created_at'    => optional($sale->created_at)->toDateTimeString(),
                'contracted_at' => $sale->sale_date ? (string) $sale->sale_date : null,
                'reference'     => null,
            ],
            'checklist_created_at' => optional($sc->created_at)->toDateTimeString(),
            'created_at'           => optional($sc->created_at)->toDateTimeString(),
        ]);
    }

    /* =========================================================
       Admin: update state (complete/na/etc.)
       ========================================================= */

    public function updateState(Request $r, Sale $sale, SaleChecklistItem $item)
    {
        $this->ensureRoleCanAccessSale($r, $sale, 'admin');
        $this->assertItemBelongsToSale($sale, $item);

        $data = $r->validate([
            'state' => 'required|in:not_started,todo,in_progress,waiting_on_client,uploaded,pending_review,approved,rejected,blocked,complete,na',
            'note'  => 'nullable|string|max:1000',
        ]);

        $dbState = $this->dbState($data['state']);

        $before = (int) $item->saleChecklist->progress_cached;

        $item->update([
            'state'        => $dbState,
            'notes'        => $data['note'] ?? $item->notes,
            'completed_at' => $this->isDone($dbState) ? now() : null,
        ]);

        $sc = $item->saleChecklist;
        $after = $this->computeProgress($sc);
        $sc->update(['progress_cached' => $after]);

        /* ── notifications ───────────────────────────────────────── */

        // Admin stream (all updates)
        $this->notifyAdmins($sale, 'state_changed', $item, [
            'to'   => $dbState,
            'note' => $data['note'] ?? null,
        ]);

        // Client: action required?
        if ($sale->client?->user && ChecklistSignals::isClientActionRequired($item, $dbState)) {
            $sale->client->user->notify(new ClientActionRequired($sale, $item, $data['note'] ?? null));
        }

        // Client: stage milestone?
        $stageId = $item->task?->stage?->id;
        if ($stageId && $sale->client?->user) {
            $completed = ChecklistSignals::isStageCompletedForClient($sc, $stageId);
            if ($completed) {
                $stageLabel = $item->task?->stage?->label ?? 'A stage';
                $sale->client->user->notify(new ClientMilestone($sale, "{$stageLabel} finished. Nice progress!"));
            }
        }

        // Sale completed? (by progress or explicit status)
        $this->notifySaleCompletedIfNeeded($sc, $sale, $before, $after);

        return response()->noContent();
    }

    /* =========================================================
       Helpers for link-driven state
       ========================================================= */

    /** Set item->state based on ALL of its links and refresh cached progress. */
    protected function syncItemStateFromLinks(SaleChecklistItem $item): void
    {
        $links = $item->links()->get(['review_state']);
        $hasRejected = $links->contains(fn ($l) => $l->review_state === 'rejected');
        $hasPending  = $links->contains(fn ($l) => $l->review_state === 'pending');
        $hasApproved = $links->contains(fn ($l) => $l->review_state === 'approved');

        if ($hasRejected) {
            $new = 'rejected';
        } elseif ($hasPending) {
            $new = 'pending_review';
        } elseif ($hasApproved) {
            $new = $item->task->requires_review ? 'approved' : 'complete';
        } else {
            $new = 'not_started';
        }

        $item->update(['state' => $new]);

        $sc = $item->saleChecklist;
        $sc->update(['progress_cached' => $this->computeProgress($sc)]);
    }

    /* =========================================================
       Agent/Client: upload (stored under sale documents, private)
       ========================================================= */

    public function upload(Request $r, Sale $sale, SaleChecklistItem $item)
    {
        $role = $r->route('role') ?? 'client';
        $this->ensureRoleCanAccessSale($r, $sale, $role);
        $this->assertItemBelongsToSale($sale, $item);

        // Accept single file (file) or multiple (files[])
        $files = [];
        if ($r->hasFile('files')) {
            $r->validate([
                'files'    => 'required|array|min:1',
                'files.*'  => 'file|max:51200',
                'titles'   => 'sometimes|array',
                'titles.*' => 'nullable|string|max:255',
            ]);
            $files = $r->file('files');
        } else {
            $r->validate(['file' => 'required|file|max:51200', 'title' => 'nullable|string|max:255']);
            $files = [$r->file('file')];
        }

        $documentIds = [];

        foreach ($files as $idx => $file) {
            $path = $file->store("sales/{$sale->sale_id}/checklist", 'private');

            $title = $r->input('title');
            if (!$title && is_array($r->input('titles'))) {
                $title = $r->input('titles')[$idx] ?? null;
            }
            $title = (string) ($title ?: $file->getClientOriginalName());

            $doc = $sale->documents()->create([
                'title' => $title,
                'path'  => $path,
            ]);

            SaleChecklistItemLink::create([
                'checklist_item_id' => $item->id,
                'document_model'    => SaleDocument::class,
                'document_id'       => $doc->id,
                'review_state'      => $item->task->requires_review ? 'pending' : 'approved',
            ]);

            $documentIds[] = $doc->id;
        }

        // Transition the item after uploads
        $item->update([
            'state' => $item->task->requires_review ? 'pending_review' : 'complete',
        ]);

        $sc = $item->saleChecklist;
        $before = (int) $sc->progress_cached;
        $after  = $this->computeProgress($sc);
        $sc->update(['progress_cached' => $after]);

        /* ── notifications ───────────────────────────────────────── */

        // Admins: something was uploaded
        $this->notifyAdmins($sale, 'uploaded', $item);

        // If requires review, also fire your existing specific notification (if present)
        if ($item->task->requires_review && class_exists(\App\Notifications\ChecklistItemPendingReview::class)) {
            $admins = User::where('role', 'admin')->get();
            if ($admins->isNotEmpty()) {
                Notification::send($admins, new \App\Notifications\ChecklistItemPendingReview($sale, $item));
            }
        }

        // Client milestone if upload completes a non-review stage
        if (! $item->task->requires_review && $sale->client?->user) {
            $stageId = $item->task?->stage?->id;
            if ($stageId && ChecklistSignals::isStageCompletedForClient($sc, $stageId)) {
                $stageLabel = $item->task?->stage?->label ?? 'A stage';
                $sale->client->user->notify(new ClientMilestone($sale, "{$stageLabel} finished. Nice progress!"));
            }
        }

        // Sale completed? (by progress or explicit status)
        $this->notifySaleCompletedIfNeeded($sc, $sale, $before, $after);

        return response()->json(['document_ids' => $documentIds]);
    }

    /* =========================================================
       Admin: review (approve / reject)
       ========================================================= */

    public function review(Request $r, Sale $sale, SaleChecklistItem $item)
    {
        $this->ensureRoleCanAccessSale($r, $sale, 'admin');
        $this->assertItemBelongsToSale($sale, $item);

        $data = $r->validate([
            'link_id'  => 'required|exists:sale_checklist_item_links,id',
            'decision' => 'required|in:approved,rejected',
            'note'     => 'nullable|string|max:1000',
        ]);

        $link = SaleChecklistItemLink::where('id', $data['link_id'])
            ->where('checklist_item_id', $item->id)
            ->firstOrFail();

        $link->update([
            'review_state' => $data['decision'],
            'reviewed_by'  => $r->user()->id,
            'review_note'  => $data['note'] ?? null,
        ]);

        // Recompute item state from all links
        $this->syncItemStateFromLinks($item);

        // Optional: your existing agent/client notification
        $notifClass = 'App\\Notifications\\ChecklistItemReviewed';
        if (class_exists($notifClass)) {
            $agentUser  = $sale->agent?->user;
            $clientUser = $sale->client?->user;
            $recipients = collect([$agentUser, $clientUser])->filter()->all();
            if ($recipients) {
                Notification::send($recipients, new $notifClass($sale, $item, $data['decision'], $data['note'] ?? null));
            }
        }

        /* ── NEW notifications ───────────────────────────────────── */

        // Admin stream
        $this->notifyAdmins($sale, 'reviewed', $item, [
            'decision' => $data['decision'],
            'note'     => $data['note'] ?? null,
        ]);

        // Client: rejected → action required (include note if present)
        if ($data['decision'] === 'rejected' && $sale->client?->user) {
            $reason = $data['note'] ? "Needs changes: {$data['note']}" : 'Please address the review feedback.';
            $sale->client->user->notify(new ClientActionRequired($sale, $item, $reason));
        }

        // Client: approved may complete a stage → milestone
        $sc = $item->saleChecklist;
        $stageId = $item->task?->stage?->id;
        if ($stageId && $sale->client?->user) {
            $completed = ChecklistSignals::isStageCompletedForClient($sc, $stageId);
            if ($completed) {
                $stageLabel = $item->task?->stage?->label ?? 'A stage';
                $sale->client->user->notify(new ClientMilestone($sale, "{$stageLabel} finished. Great work!"));
            }
        }

        // Sale completed? (by progress or explicit status)
        $before = (int) $sc->getOriginal('progress_cached') ?: (int) $sc->progress_cached;
        $after  = $this->computeProgress($sc);
        $sc->update(['progress_cached' => $after]);
        $this->notifySaleCompletedIfNeeded($sc, $sale, $before, $after);

        return response()->noContent();
    }

    /* =========================================================
       Admin: add repeatable bundle (MVTR/Quitclaim/BOSPN)
       ========================================================= */

    public function addRepeatable(Request $r, Sale $sale, int $stageId)
    {
        $this->ensureRoleCanAccessSale($r, $sale, 'admin');

        $stage = \App\Models\ChecklistStage::findOrFail($stageId);
        $group = $r->validate([
            'group' => 'required|in:mvtr,quitclaim,bospn',
            'label' => 'nullable|string|max:120',
        ]);

        $sc = $this->checklistForSaleOrFail($sale);

        DB::transaction(function () use ($stage, $group, $sc) {
            $repeatTasks = ChecklistTask::where('stage_id', $stage->id)
                ->where('is_repeatable', true)
                ->where('repeat_group', $group['group'])
                ->get();

            $parent = SaleChecklistItem::create([
                'sale_checklist_id' => $sc->id,
                'task_id'           => optional($repeatTasks->first())->id,
                'state'             => 'not_started',
                'meta'              => ['container' => true, 'label' => $group['label'] ?? strtoupper($group['group']).' item'],
            ]);

            foreach ($repeatTasks as $task) {
                SaleChecklistItem::create([
                    'sale_checklist_id' => $sc->id,
                    'task_id'           => $task->id,
                    'parent_item_id'    => $parent->id,
                    'state'             => 'not_started',
                ]);
            }
        });

        $before = (int) $sc->progress_cached;
        $after  = $this->computeProgress($sc);
        $sc->update(['progress_cached' => $after]);

        // Admins: structure changed
        $this->notifyAdmins($sale, 'repeat_group_added', null, [
            'stage_id' => $stageId,
            'group'    => $group['group'],
        ]);

        return response()->json(['ok' => true]);
    }

    /* =========================================================
       Admin: recalc progress (utility)
       ========================================================= */

    public function recalc(Request $r, Sale $sale)
    {
        $this->ensureRoleCanAccessSale($r, $sale, 'admin');

        $sc = $this->checklistForSaleOrFail($sale);
        $before = (int) $sc->progress_cached;
        $after  = $this->computeProgress($sc);
        $sc->update(['progress_cached' => $after]);

        // If this recalc tips it over 100, also notify completion
        $this->notifySaleCompletedIfNeeded($sc, $sale, $before, $after);

        return response()->json(['progress' => (int) $sc->progress_cached]);
    }
}
