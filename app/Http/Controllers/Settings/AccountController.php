<?php

// app/Http/Controllers/Settings/AccountController.php
namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function edit(Request $request)
    {
        $user   = $request->user();
        $target = $user->profileable;          // Admin | Agent | Client

        return Inertia::render('settings/account', [
            'role'   => $user->role,
            'record' => $target->only(
                ['firstname','lastname','phone','address','city','state','zipcode']
            ),
            // email always comes from users
            'email'  => $user->email,
        ]);
    }

    public function update(Request $request)
    {
        $user   = $request->user();
        $target = $user->profileable;

        $rules  = [
            'email'     => ['required','email','unique:users,email,'.$user->id],
            'firstname' => ['required','string','max:255'],
            'lastname'  => ['required','string','max:255'],
            'phone'     => ['nullable','string','max:30'],
            'address'   => ['nullable','string','max:255'],
            'city'      => ['nullable','string','max:100'],
            'state'     => ['nullable','string','max:100'],
            'zipcode'   => ['nullable','string','max:20'],
        ];

        $data = $request->validate($rules);

        // 1) update the polymorphic model (Admin / Agent / Client)
        $target->update(collect($data)->except('email')->toArray());

        // 2) update the users table e-mail
        $user->update(['email' => $data['email']]);

        return back()->with('success','Profile updated!');
    }
}
