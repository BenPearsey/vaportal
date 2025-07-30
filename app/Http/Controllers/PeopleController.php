<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PeopleController extends Controller
{
    public function index(Request $r)
    {
        $q     = trim($r->query('q', ''));
        $limit = (int) $r->query('limit', 12);

        /* ----------------------------------------------------------
         | Users  (join the ONE profile row that has firstname/lastname)
         * ---------------------------------------------------------*/
       // ... PeopleController@index
$users = DB::table('users')
    ->leftJoin('admins',  'admins.user_id',  '=', 'users.id')
    ->leftJoin('agents',  'agents.user_id',  '=', 'users.id')
    ->leftJoin('clients', 'clients.user_id', '=', 'users.id')
    ->selectRaw('
        users.id,
        users.email AS email,
        COALESCE(admins.firstname, agents.firstname, clients.firstname) AS firstname,
        COALESCE(admins.lastname , agents.lastname , clients.lastname ) AS lastname
    ')
    ->when($q, function ($qB) use ($q) {
        $qB->where(function ($w) use ($q) {
            $w->where(DB::raw("CONCAT(
                COALESCE(admins.firstname,agents.firstname,clients.firstname),' ',
                COALESCE(admins.lastname ,agents.lastname ,clients.lastname)
            )"), 'like', "%$q%")
            ->orWhere('users.email', 'like', "%$q%");
        });
    })
    ->limit($limit)
    ->get()
    ->map(fn ($u) => [
        'id'    => $u->id,
        'type'  => 'user',
        'name'  => trim("{$u->firstname} {$u->lastname}") ?: $u->email,
        'email' => $u->email,
    ]);


        /* ----------------------------------------------------------
         | Contacts
         * ---------------------------------------------------------*/
        $contacts = Contact::query()
            ->when($q, fn ($sql) => $sql
                ->whereRaw("CONCAT(firstname,' ',lastname) like ?", ["%$q%"])
                ->orWhere('email',   'like', "%$q%")
                ->orWhere('company', 'like', "%$q%"))
            ->limit($limit)
            ->get()
            ->map(fn ($c) => [
                'id'    => $c->id,
                'type'  => 'contact',
                'name'  => trim("{$c->firstname} {$c->lastname}") ?: $c->company,
                'email' => $c->email,
            ]);

        /* ----------------------------------------------------------
         | Merge & dedupe (user entry wins on duplicate email)
         * ---------------------------------------------------------*/
        $people = Collection::make($users)
            ->merge($contacts)
            ->unique('email')               // dedupe by email
            ->values()
            ->take($limit);                 // final cap

        return response()->json($people);
    }
}
