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

        'activity_type'=> 'sometimes|string|in:Meeting,Call,Task,Other',
        'status'       => 'sometimes|nullable|string|in:scheduled,completed,canceled',

        // accept null
        'recurrence_rule'       => 'sometimes|nullable|string',
        'recurrence_exceptions' => 'sometimes|nullable|array',
        'recurrence_exceptions.*'=> 'date',
        'is_private'            => 'sometimes|boolean',

        'participants' => 'sometimes|nullable|array',
        'participants.*'=> 'exists:users,id',

        'priority'         => 'sometimes|in:low,medium,high',
        'location'         => 'sometimes|nullable|string|max:255',
        'reminder_minutes' => 'sometimes|nullable|integer|min:1|max:10080',
    ];
}

}
