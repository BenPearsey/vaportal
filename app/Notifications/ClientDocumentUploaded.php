<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Client;
use App\Models\ClientDocument;

class ClientDocumentUploaded extends Notification implements ShouldQueue
{
    use Queueable;

    protected Client $client;
    protected ClientDocument $document;

    public function __construct(Client $client, ClientDocument $document)
    {
        $this->client   = $client;
        $this->document = $document;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

// in App\Notifications\ClientDocumentUploaded

public function toDatabase($notifiable): array
{
    // pass `$absolute = false` as the 3rd arg to `route()`
    $url = route(
        'admin.clients.overview',
        ['client' => $this->client->client_id],
        false
    );

    return [
        'message' => "… uploaded a new document for {$this->client->firstname} {$this->client->lastname}",
        'url'     => $url,  // e.g. "/admin/clients/3/overview"
    ];
}


    public function toMail($notifiable): MailMessage
    {
        $agent = $this->client->agent;
        $agentName = $agent
            ? "{$agent->firstname} {$agent->lastname}"
            : 'An agent';

        return (new MailMessage)
            ->subject('New Client Document Uploaded')
            ->greeting("Hello {$notifiable->name},")
            ->line("{$agentName} just uploaded a new document for **{$this->client->firstname} {$this->client->lastname}**.")
            // ← same here: link back to the client overview
            ->action('View Client', route('admin.clients.overview', $this->client->client_id))
            ->line('Please review and take any necessary action.');
    }
}
