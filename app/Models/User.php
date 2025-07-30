<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /* ───────────────────── Fillable / Hidden / Casts ─────────────────── */

    protected $fillable = ['email', 'password', 'role'];

    protected $hidden   = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /* ───────────────────── Relationships ─────────────────────────────── */

    public function admin()  { return $this->hasOne(Admin::class,  'user_id'); }
    public function agent()  { return $this->hasOne(Agent::class,  'user_id'); }
    public function client() { return $this->hasOne(Client::class, 'user_id'); }

    /* ───────────────────── Display name accessor ⭐ NEW ⭐ ────────────── */

    protected $appends = ['display_name'];   // include in JSON output

    public function getDisplayNameAttribute(): string
    {
        if ($this->relationLoaded('admin')  && $this->admin) {
            return trim("{$this->admin->firstname} {$this->admin->lastname}");
        }
        if ($this->relationLoaded('agent')  && $this->agent) {
            return trim("{$this->agent->firstname} {$this->agent->lastname}");
        }
        if ($this->relationLoaded('client') && $this->client) {
            return trim("{$this->client->firstname} {$this->client->lastname}");
        }
        return $this->email;                 // fallback
    }

    public function contactPayload(): array
{
    return [
        'firstname' => $this->admin?->firstname  // pull from related record if you have one
            ?? $this->agent?->firstname
            ?? $this->client?->firstname
            ?? '',
        'lastname'  => $this->admin?->lastname
            ?? $this->agent?->lastname
            ?? $this->client?->lastname
            ?? '',
        'email'     => $this->email,
    ];
}
public function contactKey(): array
{
    return ['email' => $this->email];            // Users are uniquely by e-mail
}

}
