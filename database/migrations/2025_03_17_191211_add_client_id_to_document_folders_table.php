<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddClientIdToDocumentFoldersTable extends Migration
{
    public function up()
    {
        Schema::table('document_folders', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->after('parent_id');
            $table->foreign('client_id')
                  ->references('client_id')
                  ->on('clients')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('document_folders', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn('client_id');
        });
    }
}
