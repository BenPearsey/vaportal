<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CarrierProductSeeder extends Seeder
{
    public function run()
    {
        // Define the product-to-carrier mappings.
        // Use keys that exactly match the values in your product select dropdown.
        $mappings = [
            'annuity' => [
                'Allianz',
                'F&G',
                'American Equity',
                'Equitrust',
                'GBU',
                'North American',
            ],
            'iul' => [
                'Allianz',
                'F&G',
                'North American',
                'Mutual of Omaha',
                'Irrevocable Spendthrift Trust',
                'Benson Financial',
                'Revocable Living Trust',
                'McGee Law Firm',
            ],
            'precious_metals' => [
                'NGC',
            ],
            'final_expense' => [
                'Mutual of Omaha',
                'Transamerica',
                'GTL',
            ],
            '10_term' => [
                'Mutual of Omaha',
                'Transamerica',
                'North American',
            ],
            '20_term' => [
                'Mutual of Omaha',
                'Transamerica',
                'North American',
            ],
            '30_term' => [
                'Mutual of Omaha',
                'Transamerica',
                'North American',
            ],
            'trust' => [
                // Add mappings for trust if needed.
            ],
            'term_life' => [
                // Add mappings for term life if needed.
            ],
            'whole_life' => [
                'Foresters',
                'Mutual of Omaha',
                'Transamerica',
                'GTL',
                'Guaranteed Life',
                'Gerber',
            ],
             'irrevocable_trust' => ['Benson Financial'],
            'revocable_trust'   => ['McGee Law Firm', 'Legal Zoom'],
            'guaranteed_life'   => ['Gerber', 'Mutual of Omaha'],
            'medicare'          => ['United Health Care', 'Humana', 'Cigna'],

                        '10_term'           => ['Assurity'],
            '20_term'           => ['Assurity'],
            '30_term'           => ['Assurity'],
        ];

        foreach ($mappings as $product => $carrierNames) {
            foreach ($carrierNames as $carrierName) {
                // Look up the carrier by name.
                $carrier = DB::table('carriers')->where('name', $carrierName)->first();
                if ($carrier) {
                    DB::table('carrier_product')->insert([
                        'carrier_id' => $carrier->id,
                        'product'    => strtolower($product), // ensure lowercase for matching
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
