@component('mail::message')
# Welcome, {{ $admin->firstname }}!

Your admin account has been created on our portal. Please use the temporary password below to log in. Be sure to change your password immediately.

@component('mail::panel')
Temporary Password: **{{ $tempPassword }}**
@endcomponent

@component('mail::button', ['url' => route('login')])
Log In
@endcomponent

If you have any questions, please contact our support team.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
