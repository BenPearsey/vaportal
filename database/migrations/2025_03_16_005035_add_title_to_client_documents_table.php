<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTitleToClientDocumentsTable extends Migration
{
    public function up()
    {
        Schema::table('client_documents', function (Blueprint $table) {
            $table->string('title')->nullable()->after('path');
        });
    }

    public function down()
    {
        Schema::table('client_documents', function (Blueprint $table) {
            $table->dropColumn('title');
        });
    }
}
