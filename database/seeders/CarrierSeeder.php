<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CarrierSeeder extends Seeder
{
    public function run()
    {
        $carriers = [
            'Allianz',
            'F&G',
            'American Equity',
            'Equitrust',
            'GBU',
            'North American',
            'Mutual of Omaha',
            'Irrevocable Spendthrift Trust',
            'Benson Financial',
            'Revocable Living Trust',
            'McGee Law Firm',
            'NGC',
            'Transamerica',
            'GTL',
            'Foresters',
            'Guaranteed Life',
            'Gerber',
                        'United Health Care',
            'Humana',
            'Cigna',
            'Legal Zoom',
            'Assurity',
        ];

        foreach ($carriers as $carrierName) {
            DB::table('carriers')->updateOrInsert(
                ['name' => $carrierName],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
