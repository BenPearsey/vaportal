<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

   // app/Http/Requests/StoreEventRequest.php
public function rules(): array
{
    return [
        'title'        => 'required|string|max:255',
        'description'  => 'nullable|string',
        'start_datetime'=> 'required|date',
        'end_datetime' => 'required|date|after_or_equal:start_datetime',
        'all_day'      => 'boolean',

        'activity_type'=> 'required|string|in:Meeting,Call,Task,Video Call', 
        'status'       => 'nullable|string|in:scheduled,completed,canceled',
        'recurrence_rule'       => 'nullable|string',        
        'recurrence_exceptions' => 'nullable|array',         
        'recurrence_exceptions.*'=> 'date',
        'is_private'   => 'boolean',

        'user_participants'    => 'array',
        'user_participants.*'  => 'exists:users,id',

        'contact_participants'    => 'array',
        'contact_participants.*'  => 'exists:contacts,id',

        'priority'         => 'sometimes|in:low,medium,high',
'location' => [
    'sometimes','nullable','string','max:255',
    function ($attr, $value, $fail) {
        $type = $this->input('activity_type');
        if ($type === 'Video Call' && !filter_var($value, FILTER_VALIDATE_URL))
            $fail('Join link must be a valid URL.');
        if ($type === 'Call' && !preg_match('/^\+?[0-9\s\-\(\)]+$/', $value))
            $fail('Phone number format invalid.');
    }
],

        'reminder_minutes' => 'sometimes|nullable|integer|min:1|max:10080',
        'invite_emails'   => ['array'],
'invite_emails.*' => ['email','max:255'],

    ];
}

}
