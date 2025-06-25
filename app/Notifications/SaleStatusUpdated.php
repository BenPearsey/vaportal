<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;

class SaleStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    protected Sale $sale;

    public function __construct(Sale $sale)
    {
        $this->sale = $sale;
    }

    /**
     * Deliver via both database (for in‑app) and mail.
     */
    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Stored in the `notifications` table.
     */
    public function toDatabase($notifiable): array
    {
        return [
            'message' => "Sale #{$this->sale->sale_id} status changed to {$this->sale->status}.",
            'url'     => route('agent.sales.show', $this->sale->sale_id),
        ];
    }

    /**
     * Sent as an email as well.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Sale #{$this->sale->sale_id} Status Updated")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your sale (ID: {$this->sale->sale_id}) status is now “{$this->sale->status}.”")
            ->action('View Sale', route('agent.sales.show', $this->sale->sale_id))
            ->line('Thank you for using the portal!');
    }
}
