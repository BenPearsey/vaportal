<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;
use App\Models\SaleChecklistItem;

class ClientActionRequired extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Sale $sale, public SaleChecklistItem $item, public string $reason = 'Action required')
    {}

    public function via($notifiable): array { return ['database','mail']; }

    public function toDatabase($notifiable): array
    {
        return [
            'sale_id' => $this->sale->sale_id,
            'task'    => $this->item->task?->label,
            'reason'  => $this->reason,
            'url'     => route('client.sales.show', $this->sale->sale_id) . '#checklist',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Action needed: {$this->item->task?->label}")
            ->line("We need your input for your {$this->sale->product}.")
            ->line("Task: {$this->item->task?->label}")
            ->action('Open your checklist', route('client.sales.show', $this->sale->sale_id) . '#checklist')
            ->line('Thank you!');
    }
}
