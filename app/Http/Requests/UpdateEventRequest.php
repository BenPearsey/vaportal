<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
{
    return [
        'title'        => 'sometimes|required|string|max:255',
        'description'  => 'sometimes|nullable|string',
        'start_datetime'=> 'sometimes|required|date',
        'end_datetime' => 'sometimes|required|date|after_or_equal:start_datetime',
        'all_day'      => 'sometimes|boolean',

        'activity_type'=> 'sometimes|string|in:Meeting,Call,Task,Video Call',
        'status'       => 'sometimes|nullable|string|in:scheduled,completed,canceled',

        // accept null
        'recurrence_rule'       => 'sometimes|nullable|string',
        'recurrence_exceptions' => 'sometimes|nullable|array',
        'recurrence_exceptions.*'=> 'date',
        'is_private'            => 'sometimes|boolean',

        'participants' => 'sometimes|nullable|array',
        'participants.*'=> 'exists:users,id',

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
