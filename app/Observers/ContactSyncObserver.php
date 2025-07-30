<?php

namespace App\Observers;

use App\Models\Contact;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Keeps the contacts table in-sync with any model that
 * implements the two small helper methods shown below.
 *
 *   ->saved()     create / update the matching contact
 *   ->deleting()  unlink (null-out FK) but keep row
 */
class ContactSyncObserver
{
    /* -------- create & update -------- */
    public function saved(Model $model): void
    {
        DB::transaction(function () use ($model) {

            /* Which columns uniquely identify this model in contacts? */
            $key = $model->contactKey();           // e.g. ['admin_id' => 7]

            /* Try find by FK first … then fall back to email */
            $contact = Contact::where($key)->first()
                     ?? (isset($model->email)
                         ? Contact::where('email', $model->email)->first()
                         : null);

            if (!$contact) {
                $contact = new Contact([
                    'created_by' => auth()->id() ?? 1,
                ] + $key);
            }

            $contact->fill($model->contactPayload());
            $contact->fill($key);                  // keep FK fresh
            $contact->save();
        });
    }

    /* -------- delete (null FK, keep row) -------- */
    public function deleting(Model $model): void
    {
        Contact::where($model->contactKey())
               ->update(array_map(fn () => null, $model->contactKey()));
    }
}
