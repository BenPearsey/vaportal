<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAnnouncementsTable extends Migration
{
    public function up()
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            // The admin who posted the announcement
            $table->unsignedBigInteger('admin_id')->nullable();
            // Title of the announcement
            $table->string('title');
            // Type of announcement: text, image, or video (you can add more as needed)
            $table->enum('type', ['text', 'image', 'video'])->default('text');
            // Main content: this can be the text content or a URL for an image/video
            $table->text('content');
            // An optional description or extra details (for example, to accompany an image)
            $table->text('description')->nullable();
            // Optionally, when this announcement should be published (or use created_at)
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            // If you have an admins table, you can add a foreign key:
            // $table->foreign('admin_id')->references('id')->on('admins')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('announcements');
    }
}
