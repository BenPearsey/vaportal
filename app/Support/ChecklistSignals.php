<?php

namespace App\Support;

use App\Models\SaleChecklist;
use App\Models\SaleChecklistItem;

final class ChecklistSignals
{
    /** Is this item state one that suggests the client must do something? */
    public static function isClientActionRequired(SaleChecklistItem $item, string $dbState): bool
    {
        // "todo" / "pending_review" / "rejected" for tasks visible to client and requiring upload/review
        $task = $item->task;
        if (! $task) return false;

        // If the task is upload-ish OR requires review, and it's not done — action is likely needed.
        $needsWork = in_array($dbState, ['not_started','pending_review','rejected','in_progress','waiting_on_client','uploaded'], true);
        $clientVisible = in_array(($task->visibility ?? 'all'), ['all','client'], true);

        return $clientVisible && ($task->action_type === 'upload' || $task->requires_review) && $needsWork;
    }

    /** Is an entire STAGE (client-visible items) complete? */
    public static function isStageCompletedForClient(SaleChecklist $sc, int $stageId): bool
    {
        $items = $sc->items()->with('task')->whereHas('task', fn($q) => $q->where('stage_id', $stageId))->get();
        $clientVisible = $items->filter(fn($it) => in_array(($it->task->visibility ?? 'all'), ['all','client'], true));
        if ($clientVisible->isEmpty()) return false;

        foreach ($clientVisible as $it) {
            if (! in_array($it->state, ['approved','complete','na'], true)) {
                return false;
            }
        }
        return true;
    }
}
