@component('mail::layout')

{{-- ───── Header (centered logo) ───── --}}
@slot('header')
<table width="100%"><tr><td align="center">
    <img src="cid:va-logo" alt="VA Logo" width="90" style="display:block;">
</td></tr></table>
@endslot

{{-- ───── Body ───── --}}
# Reminder: {{ $event->title }}

The event below starts **soon**.

**When**: {{ $event->start_datetime->format('F j, Y g:i A') }}
@if(!$event->all_day) – {{ $event->end_datetime->format('g:i A') }} @endif  
**Where**: {{ $event->location ?? '—' }}  
**Type**: {{ $event->activity_type }}

@isset($event->description)
> {{ $event->description }}
@endisset

@component('mail::button', ['url' => $googleLink, 'color' => 'primary'])
Add to Google Calendar
@endcomponent

@if (Route::has('events.show') && ! empty($recipient) && method_exists($recipient,'can') && $recipient->can('view', $event))
    @component('mail::button', ['url' => route('events.show', $event), 'color' => 'secondary'])
    View in Calendar
    @endcomponent
@endif

@isset($event->attachments)
@if ($event->attachments->isNotEmpty())
### Attachments
@foreach($event->attachments as $a)
* {{ $a->original_name }}
@endforeach
@endif
@endisset

{{-- ───── Footer ───── --}}
@slot('footer')
© {{ date('Y') }} Vertical Alternatives
@endslot
@endcomponent
