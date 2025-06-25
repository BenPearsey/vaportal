<?php

namespace App\Mail;

use App\Models\Client;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewClientWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $client;
    public $tempPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(Client $client, string $tempPassword)
    {
        $this->client       = $client;
        $this->tempPassword = $tempPassword;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("Welcome to Our Portal")
                    ->markdown('emails.clients.welcome');
    }
}
