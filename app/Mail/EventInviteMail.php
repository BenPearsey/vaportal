<?php

namespace App\Mail;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Sabre\VObject\Component\VCalendar;

class EventInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Event $event,
        public $recipient
    ) {
        $this->event->loadMissing('attachments');
    }

    public function build(): static
    {
        $this->attach(
            public_path('logo2.png'),
            ['as' => 'logo2.png', 'mime' => 'image/png', 'content_id' => 'va-logo']
        );

        $mail = $this->subject("Invitation: {$this->event->title}")
            ->markdown('mail.events.invite', [
                'event'      => $this->event,
                'recipient'  => $this->recipient,
                'googleLink' => $this->googleLink(),
            ]);

        // Attach uploaded files (≤ 10 MB total)
        if ($this->event->attachments->sum('size') <= 10 * 1024 * 1024) {
            foreach ($this->event->attachments as $att) {
                $mail->attachFromStorageDisk($att->disk, $att->path, $att->original_name);
            }
        }

        // Always attach an ICS
        $mail->attachData($this->generateIcs(), 'invite.ics', [
            'mime' => 'text/calendar; method=REQUEST',
        ]);

        return $mail;
    }

    private function generateIcs(): string
    {
        $v  = new VCalendar();
        $ve = $v->add('VEVENT', [
            'SUMMARY'     => $this->event->title,
            'DTSTART'     => $this->event->start_datetime->format('Ymd\THis\Z'),
            'DTEND'       => $this->event->end_datetime->format('Ymd\THis\Z'),
            'DESCRIPTION' => $this->event->description ?? '',
            'LOCATION'    => $this->event->location   ?? '',
            'UID'         => "event-{$this->event->id}@va-portal",
        ]);

        if ($this->event->recurrence_rule) {
            $ve->add('RRULE', $this->event->recurrence_rule);
        }

        return $v->serialize();
    }

    private function googleLink(): string
    {
        $fmt = fn ($d) => $d->clone()->utc()->format('Ymd\THis\Z');

        return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
            . '&text='     . urlencode($this->event->title)
            . '&dates='    . $fmt($this->event->start_datetime) . '/' . $fmt($this->event->end_datetime)
            . '&details='  . urlencode($this->event->description ?? '')
            . '&location=' . urlencode($this->event->location ?? '');
    }
}
