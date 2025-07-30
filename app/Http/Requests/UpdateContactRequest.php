<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $id = $this->route('contact')->id;

        return [
            'prefix'    => ['sometimes', 'nullable', 'string', 'max:50'],
            'firstname' => ['sometimes', 'required', 'string', 'max:191'],
            'middle'    => ['sometimes', 'nullable', 'string', 'max:191'],
            'lastname'  => ['sometimes', 'required', 'string', 'max:191'],

            'email' => [
                'sometimes', 'nullable', 'email', 'max:191',
                Rule::unique('contacts', 'email')->ignore($id),
            ],
            'phone'   => ['sometimes', 'nullable', 'string', 'max:30'],
            'company' => ['sometimes', 'nullable', 'string', 'max:191'],
            'address' => ['sometimes', 'nullable', 'string', 'max:191'],
            'city'    => ['sometimes', 'nullable', 'string', 'max:120'],
            'zipcode' => ['sometimes', 'nullable', 'string', 'max:20'],
            'notes'   => ['sometimes', 'nullable', 'string'],
        ];
    }
}
