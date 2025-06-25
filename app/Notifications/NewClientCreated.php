<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Client;

class NewClientCreated extends Notification implements ShouldQueue
{
    use Queueable;

    protected Client $client;

    /**
     * Create a new notification instance.
     */
    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    /**
     * Get the notification’s delivery channels.
     */
    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Data stored in the notifications table.
     */
    public function toDatabase($notifiable): array
    {
        // Ensure agent relation is loaded
        $agent = $this->client->agent;
        $agentName = $agent
            ? "{$agent->firstname} {$agent->lastname}"
            : 'Unknown';

        return [
            'message' => "Agent {$agentName} created new client {$this->client->firstname} {$this->client->lastname}.",
            'url'     => route('admin.clients.overview', ['client' => $this->client->client_id]),
        ];
    }

    /**
     * Email that’s sent to admins.
     */
    public function toMail($notifiable): MailMessage
    {
        $agent = $this->client->agent;
        $agentName = $agent
            ? "{$agent->firstname} {$agent->lastname}"
            : 'An agent';

                    return (new MailMessage)
                        ->subject('New Client Created')
                        ->greeting("Hello {$notifiable->name},")
                        ->line("{$agentName} has created a new client:")
                        ->line("**{$this->client->firstname} {$this->client->lastname}**")
                        ->action(
                            'View Client',
                            route('admin.clients.overview', ['client' => $this->client->client_id])
                        )
                        ->line('Thank you for staying on top of your clients!');
    }
}
