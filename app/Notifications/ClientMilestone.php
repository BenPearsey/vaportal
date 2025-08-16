<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;

class ClientMilestone extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Sale $sale, public string $message)
    {}

    public function via($notifiable): array { return ['database','mail']; }

    public function toDatabase($notifiable): array
    {
        return [
            'sale_id' => $this->sale->sale_id,
            'message' => $this->message,
            'url'     => route('client.sales.show', $this->sale->sale_id) . '#checklist',
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Progress update')
            ->line($this->message)
            ->action('View progress', route('client.sales.show', $this->sale->sale_id) . '#checklist');
    }
}
