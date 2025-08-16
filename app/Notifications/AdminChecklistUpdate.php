<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;
use App\Models\SaleChecklistItem;

class AdminChecklistUpdate extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Sale $sale,
        public string $event,              // e.g., 'uploaded','state_changed','reviewed','repeat_added'
        public ?SaleChecklistItem $item = null,
        public ?array $extra = null        // e.g., ['decision'=>'approved']
    ) {}

    public function via($notifiable): array { return ['database','mail']; }

    public function toDatabase($notifiable): array
    {
        return [
            'sale_id' => $this->sale->sale_id,
            'event'   => $this->event,
            'task'    => $this->item?->task?->label,
            'state'   => $this->item?->state,
            'url'     => route('admin.sales.checklist.summary', $this->sale->sale_id),
            'extra'   => $this->extra,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $subject = match ($this->event) {
            'uploaded'      => 'Checklist: item uploaded (pending review)',
            'reviewed'      => 'Checklist: item reviewed',
            'state_changed' => 'Checklist: item state changed',
            'repeat_added'  => 'Checklist: repeatable bundle added',
            default         => 'Checklist updated',
        };

        $msg = (new MailMessage)
            ->subject($subject)
            ->line("Sale #{$this->sale->sale_id} ({$this->sale->product})")
            ->action('Open Checklist', route('admin.sales.checklist.summary', $this->sale->sale_id));

        if ($this->item) {
            $msg->line("Task: {$this->item->task?->label}");
        }
        if (!empty($this->extra)) {
            foreach ($this->extra as $k => $v) {
                $msg->line(ucfirst($k).": {$v}");
            }
        }
        return $msg;
    }
}
