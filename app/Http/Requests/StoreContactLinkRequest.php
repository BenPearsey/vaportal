<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;  

class StoreContactLinkRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
public function rules(): array
{
    return [
        'related_contact_id' => [
            'required', 'integer', 'different:contact_id',
            Rule::exists('contacts', 'id'),
        ],
        'relation' => ['required','string','max:30'],
    ];
}

public function authorize(): bool
{
    return $this->user()?->role === 'admin';
}

}
