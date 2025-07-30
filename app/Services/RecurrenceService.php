<?php

// app/Services/RecurrenceService.php
namespace App\Services;

use RRule\RRule;

class RecurrenceService
{
    /**
     * Expand an RRULE into individual \DateTime instances
     * between $windowStart and $windowEnd (inclusive).
     *
     * @return \DateTime[]
     */
    public function occurrences(
        string $rrule,
        \DateTime $windowStart,
        \DateTime $windowEnd
    ): array {
        $rule = new RRule($rrule, $windowStart);
        $events = [];

        foreach ($rule as $dt) {
            if ($dt > $windowEnd) {
                break;
            }
            $events[] = $dt;
        }

        return $events;
    }
}
