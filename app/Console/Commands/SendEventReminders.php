<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Mail\EventReminderMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendEventReminders extends Command
{
    protected $signature   = 'events:send-reminders';
    protected $description = 'Send event reminder e-mails';

    public function handle(): int
    {
        $now      = now()->startOfMinute();
        $matchWin = $now->copy()->addMinute();           // 60-sec window

        Event::whereNotNull('reminder_minutes')
            ->whereRaw('? = DATE_SUB(start_datetime, INTERVAL reminder_minutes MINUTE)', [$now])
            ->with('userParticipants','attachments')
            ->get()
            ->each(function ($event) {
// … inside handle()
foreach ($event->userParticipants as $user) {
    \Mail::to($user->email)->queue(
        new \App\Mail\EventReminderMail($event, $user)
    );
}

            });

        return Command::SUCCESS;
    }
}
