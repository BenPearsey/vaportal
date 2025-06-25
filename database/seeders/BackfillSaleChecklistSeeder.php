<?php

namespace Database\Seeders;   // ← ADD THIS LINE

use Illuminate\Database\Seeder;
use App\Models\Sale;

class BackfillSaleChecklistSeeder extends Seeder
{
    public function run(): void
    {
        $default = [
            ['label' => 'Application received from client',   'done' => false],
            ['label' => 'Client ID / KYC verified',           'done' => false],
            ['label' => 'All paperwork uploaded to portal',   'done' => false],
            ['label' => 'Initial funds received & reconciled','done' => false],
            ['label' => 'Submission package sent to carrier', 'done' => false],
            ['label' => 'Policy / contract issued',           'done' => false],
        ];

        Sale::whereNull('checklist')->update(['checklist' => $default]);
    }
}
