<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Admin extends Model
{
    use HasFactory;

    protected $primaryKey = 'admin_id';

    protected $fillable = [
        'user_id',
        'firstname',
        'lastname',
        'email',
        'phone',
        'address',
        'city',
        'zipcode',
        'is_super_admin',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function contact()
{
    return $this->hasOne(Contact::class, 'admin_id', 'admin_id');
}

/* --- Contact integration --- */
public function contactPayload(): array
{
    return [
        'firstname' => $this->firstname,
        'lastname'  => $this->lastname,
        'email'     => $this->email,
        'phone'     => $this->phone,
        'company'   => $this->company,
    ];
}
public function contactKey(): array
{
    return ['admin_id' => $this->admin_id];
}

}
