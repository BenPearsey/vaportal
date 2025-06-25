<?php
// database/seeders/ResourceFolderSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ResourceFolder;

class ResourceFolderSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Ensure General exists
        $general = ResourceFolder::firstOrCreate(
            ['bucket' => 0],
            ['name' => 'General', 'parent_id' => null]
        );

        // 2) Ensure Agents & Clients live *inside* General
        ResourceFolder::firstOrCreate(
            ['bucket' => 1],
            ['name' => 'Agents',  'parent_id' => $general->id]
        );
        ResourceFolder::firstOrCreate(
            ['bucket' => 2],
            ['name' => 'Clients', 'parent_id' => $general->id]
        );
    }
}
