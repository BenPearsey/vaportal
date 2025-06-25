<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddParentIdToDocumentFoldersTable extends Migration
{
    public function up()
    {
        Schema::table('document_folders', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable()->after('name');
            $table->foreign('parent_id')->references('id')->on('document_folders')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('document_folders', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
}
