<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class CustomAnnouncement extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string  $title,
        public string  $body,          // plain text or small HTML chunk
        public ?string $url = null     // optional deep-link
    ) {}

    public function via($notifiable): array
    {
        return ['database'];           // later you can add 'mail', 'broadcast', …
    }

    public function toDatabase($notifiable): DatabaseMessage
    {
        return new DatabaseMessage([
            'message' => $this->title ?: \Str::limit($this->body, 60),


            'title' => $this->title,
            'body'  => $this->body,
            'url'   => $this->url,
        ]);
    }
}
