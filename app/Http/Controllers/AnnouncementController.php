<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of all announcements for management.
     */
    public function index()
    {
        // Retrieve all announcements ordered by created_at descending.
        $announcements = Announcement::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/manage-announcements', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Show the form for creating a new announcement.
     */
    public function create()
    {
        return Inertia::render('admin/add-announcement', [
            'announcement' => new Announcement(),
        ]);
    }

    /**
     * Store a newly created announcement in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:text,image,video',
            'content'     => 'required', // For text announcements, this is Slate JSON; for media, a URL.
            'description' => 'nullable|string',
        ]);

        // Optionally assign the logged-in admin's ID.
        $validated['admin_id'] = auth()->user()->id ?? null;

        Announcement::create($validated);

        return redirect()->route('admin.announcement.manage')
            ->with('success', 'Announcement posted successfully!');
    }

    /**
     * Show the form for editing the specified announcement.
     */
    public function edit(Announcement $announcement)
    {
        return Inertia::render('admin/edit-announcement', [
            'announcement' => $announcement,
        ]);
    }

    /**
     * Update the specified announcement in storage.
     */
    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:text,image,video',
            'content'     => 'required',
            'description' => 'nullable|string',
        ]);

        $announcement->update($validated);

        return redirect()->route('admin.announcement.manage')
            ->with('success', 'Announcement updated successfully!');
    }

    /**
     * Remove the specified announcement from storage.
     */
    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return redirect()->route('admin.announcement.manage')
            ->with('success', 'Announcement deleted successfully!');
    }

    /**
     * Handle file uploads for announcements.
     */
    public function upload(Request $request)
    {
        // Validate file: adjust mime types and max size as needed.
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,mp4,avi,mov,wmv|max:102400', // max 100MB
        ]);

        // Store the file in the "uploads" directory on the public disk.
        $path = $request->file('file')->store('uploads', 'public');

        return response()->json(['url' => asset('storage/' . $path)]);
    }
}
