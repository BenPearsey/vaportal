<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Sale;

class SaleCreated extends Notification 
{
    use Queueable;

    protected Sale $sale;

    public function __construct(Sale $sale)
    {
        $this->sale = $sale;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        $client = $this->sale->client;
        $agent  = $this->sale->agent;
        $agentName  = $agent
            ? "{$agent->firstname} {$agent->lastname}"
            : 'An agent';

        return [
            'message' => "{$agentName} created a new sale (#{$this->sale->sale_id}) for {$client->firstname} {$client->lastname}.",
            'url'     => route('admin.sales.show', $this->sale->sale_id),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $client = $this->sale->client;
        $agent  = $this->sale->agent;
        $agentName  = $agent
            ? "{$agent->firstname} {$agent->lastname}"
            : 'An agent';

        return (new MailMessage)
            ->subject("New Sale Created: #{$this->sale->sale_id}")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$agentName} has created a new sale (ID: {$this->sale->sale_id}) for client **{$client->firstname} {$client->lastname}**.")
            ->action('View Sale', route('admin.sales.show', $this->sale->sale_id))
            ->line('Thank you for staying on top of things!');
    }
}
