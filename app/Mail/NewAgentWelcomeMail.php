<?php

namespace App\Mail;

use App\Models\Agent;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewAgentWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $agent;
    public $tempPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(Agent $agent, string $tempPassword)
    {
        $this->agent = $agent;
        $this->tempPassword = $tempPassword;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("Welcome to Our Portal")
                    ->markdown('emails.agents.welcome');
    }
}
