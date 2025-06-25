<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agent;

class BackfillAgentChecklistSeeder extends Seeder
{
    public function run(): void
    {
        $template = [
            ['label' => 'Send SureLC Registration Link',             'done' => false],
            ['label' => 'Send Carrier Appointment Links',            'done' => false],
            ['label' => 'Send Welcome Email w/ Portal Registration', 'done' => false],
            ['label' => 'Set Welcome Call',                          'done' => false],
        ];

        Agent::whereNull('checklist')->chunkById(500, function ($agents) use ($template) {
            foreach ($agents as $agent) {
                $agent->update(['checklist' => $template]);
            }
        });
    }
}
