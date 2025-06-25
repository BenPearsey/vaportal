<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Client;

class ClientUpdateApproved extends Notification implements ShouldQueue
{
    use Queueable;

    protected Client $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your update to {$this->client->firstname} is approved")
            ->line("Your requested changes to client {$this->client->firstname} {$this->client->lastname} have been approved.")
            ->action('View Client', route('agent.clients.overview', $this->client->client_id));
    }
}
