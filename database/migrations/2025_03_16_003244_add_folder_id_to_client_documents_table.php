<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFolderIdToClientDocumentsTable extends Migration
{
    public function up()
    {
        Schema::table('client_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('folder_id')->nullable()->after('client_id');
            $table->foreign('folder_id')->references('id')->on('document_folders')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('client_documents', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });
    }
}
