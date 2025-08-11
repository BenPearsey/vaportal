<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');
        return $event->owner_id === $this->user()->id
            || $event->userParticipants()->where('users.id',$this->user()->id)->exists();
    }
    public function rules(): array
    {
        return ['file' => ['required','file','max:51200']]; // 50 MB
    }
}
