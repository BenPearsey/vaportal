<?php
// app/Http/Controllers/Settings/ProfileController.php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * GET  /{role}/settings/profile   — admin / agent / client
     */
    public function edit(Request $request): Response
    {
        $user  = $request->user();               // logged-in User
        $role  = $user->role;                    // admin | agent | client
        $model = $this->roleModel($user);        // Admin | Agent | Client Eloquent model

        /** @var array $profile */
        $profile = $model->only([
            'firstname', 'lastname', 'phone',
            'address',   'city',    'state', 'zipcode',
        ]);

        // make sure every key exists (React hates “undefined”)
        $profile = array_merge([
            'firstname'=>'', 'lastname'=>'', 'phone'=>null,
            'address'=>'',  'city'=>'',     'state'=>'', 'zipcode'=>'',
        ], $profile);

        $profile['email'] = $user->email;        // email always lives on users table

        return Inertia::render("$role/settings/profile", [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'profile'         => $profile,       // ← sent to React
        ]);
    }

    /**
     * PATCH  /{role}/settings/profile
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user   = $request->user();
        $model  = $this->roleModel($user);
        $input  = $request->validated();

        /* -----------------------------------------------------------------
         | update role-specific table
         *-----------------------------------------------------------------*/
        $model->fill($input)->save();

        /* -----------------------------------------------------------------
         | email: keep single source of truth in users table
         *-----------------------------------------------------------------*/
        if ($user->email !== $input['email']) {
            $user->email             = $input['email'];
            $user->email_verified_at = null;     // force re-verify
            $user->save();
        }

        return back()->with('status', 'profile-updated');
    }

    /* ---------------------------------------------------------------------
     | deleting account (unchanged)
     *--------------------------------------------------------------------*/
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();
        Auth::logout();

        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /* ---------------------------------------------------------------------
     | helper: resolve the Admin / Agent / Client model from $user->role
     *--------------------------------------------------------------------*/
    private function roleModel($user)
    {
        return match ($user->role) {
            'admin'  => $user->admin,
            'agent'  => $user->agent,
            'client' => $user->client,
            default  => $user,        // fallback — shouldn’t happen
        };
    }
}
