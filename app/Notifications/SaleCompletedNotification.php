<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;

class SaleCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Sale $sale) {}

    public function via($notifiable): array { return ['database','mail']; }

    public function toDatabase($notifiable): array
    {
        $url = match ($notifiable->role) {
            'admin'  => route('admin.sales.show',   $this->sale->sale_id),
            'agent'  => route('agent.sales.show',   $this->sale->sale_id),
            'client' => route('client.sales.show',  $this->sale->sale_id),
            default  => route('home'),
        };
        return [
            'sale_id' => $this->sale->sale_id,
            'message' => "Sale #{$this->sale->sale_id} ({$this->sale->product}) is complete.",
            'url'     => $url,
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $url = $this->toDatabase($notifiable)['url'];
        return (new MailMessage)
            ->subject("Sale #{$this->sale->sale_id} Complete")
            ->line("The {$this->sale->product} sale is now complete.")
            ->action('View', $url);
    }
}
