<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\ClientUpdateRequest;

class ClientUpdateRequested extends Notification implements ShouldQueue
{
    use Queueable;

    protected ClientUpdateRequest $request;

    public function __construct(ClientUpdateRequest $request)
    {
        $this->request = $request;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase($notifiable): array
    {
        $c = $this->request->client;
        return [
            'message' => "Agent {$this->request->agent->firstname} requested updates to client {$c->firstname} {$c->lastname}.",
            'url'     => route('admin.client_update_requests.index'),
        ];
    }

    public function toMail($notifiable): MailMessage
    {
        $c = $this->request->client;
        return (new MailMessage)
            ->subject("Client Update Requested: #{$c->client_id}")
            ->line("Agent {$this->request->agent->firstname} {$this->request->agent->lastname} has requested changes to:")
            ->line(implode(', ', array_keys($this->request->payload)))
            ->action('Review Requests', route('admin.client_update_requests.index'))
            ->line('Please approve or reject.');
    }
}
