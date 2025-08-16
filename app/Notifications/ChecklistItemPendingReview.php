<?php

// app/Notifications/ChecklistItemPendingReview.php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;
use App\Models\SaleChecklistItem;

class ChecklistItemPendingReview extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Sale $sale, public SaleChecklistItem $item) {}

    public function via($notifiable) { return ['database','mail']; }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Checklist item pending review')
            ->line("Sale #{$this->sale->sale_id}: {$this->item->task_label}")
            ->line('An item was submitted and is awaiting your review.')
            ->action('Open Checklist', route('admin.sales.show', $this->sale->sale_id) . '#checklist');
    }

    public function toArray($notifiable)
    {
        return [
            'sale_id'   => $this->sale->sale_id,
            'task'      => $this->item->task_label,
            'state'     => 'pending_review',
        ];
    }
}
