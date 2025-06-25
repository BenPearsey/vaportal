<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use App\Models\Sale;
use Inertia\Inertia;

class AdminAdminController extends Controller
{
    public function create()
    {
        $admins = Admin::all();
        return Inertia::render('admin/add-admin', ['admins' => $admins]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'firstname'       => 'required|string|max:255',
            'lastname'        => 'required|string|max:255',
            'email'           => 'required|email|unique:admins,email|unique:users,email',
            'phone'           => 'nullable|string|max:20',
            'address'         => 'nullable|string|max:255',
            'city'            => 'nullable|string|max:255',
            'zipcode'         => 'nullable|string|max:10',
            'is_super_admin'  => 'sometimes|boolean',
        ]);

        $tempPassword = \Illuminate\Support\Str::random(8);

        $user = \App\Models\User::create([
            'email'    => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($tempPassword),
            'role'     => 'admin',
        ]);

        $admin = Admin::create([
            'user_id'       => $user->id,
            'firstname'     => $validated['firstname'],
            'lastname'      => $validated['lastname'],
            'email'         => $validated['email'],
            'phone'         => $validated['phone'] ?? null,
            'address'       => $validated['address'] ?? null,
            'city'          => $validated['city'] ?? null,
            'zipcode'       => $validated['zipcode'] ?? null,
            'is_super_admin'=> $validated['is_super_admin'] ?? false,
        ]);

        // Send the welcome email (ensure your Mailable is set up)
        \Illuminate\Support\Facades\Mail::to($validated['email'])
            ->send(new \App\Mail\NewAdminWelcomeMail($admin, $tempPassword));

        return redirect()->route('admin.admins')->with('success', 'Admin created successfully. Temporary password sent via email.');
    }

    public function admins()
    {
        $admins = Admin::all();
        return Inertia::render('admin/admins', ['admins' => $admins]);
    }

    public function overview(Admin $admin)
    {
        // Optionally, load additional relationships or statistics (e.g., sales)
        $sales = Sale::where('agent_id', $admin->admin_id)->get();
        return Inertia::render('admin/admin-overview', [
            'admin' => $admin,
            'sales' => $sales,
        ]);
    }

    public function destroy(Admin $admin)
    {
        $admin->delete();
        return redirect()->route('admin.admins')->with('success', 'Admin deleted successfully.');
    }

    /* … existing methods … */

    /**
     * Toggle “super admin” status for a single admin.
     */
    public function toggleSuper(Admin $admin)
    {
        // (optional) only super-admins may flip this
        // $this->authorize('superadmin');

        $admin->is_super_admin = ! $admin->is_super_admin;
        $admin->save();

        return back()->with(
            'success',
            'Super-admin status changed to '.($admin->is_super_admin ? 'YES' : 'NO').'.'
        );
    }

}
