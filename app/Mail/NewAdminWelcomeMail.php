<?php

namespace App\Mail;

use App\Models\Admin;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewAdminWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $admin;
    public $tempPassword;

    /**
     * Create a new message instance.
     */
    public function __construct(Admin $admin, string $tempPassword)
    {
        $this->admin = $admin;
        $this->tempPassword = $tempPassword;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("Welcome to the Vertical Alternatives Admin Portal")
                    ->markdown('emails.admins.welcome');
    }
}
