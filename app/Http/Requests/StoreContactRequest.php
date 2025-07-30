<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'prefix'    => ['nullable', 'string', 'max:50'],
            'firstname' => ['required', 'string', 'max:191'],
            'middle'    => ['nullable', 'string', 'max:191'],
            'lastname'  => ['required', 'string', 'max:191'],

            'email'  => ['nullable', 'email', 'max:191', 'unique:contacts,email'],
            'phone'  => ['nullable', 'string', 'max:30'],
            'company'=> ['nullable', 'string', 'max:191'],
            'notes'  => ['nullable', 'string'],
            
        ];
    }
}
