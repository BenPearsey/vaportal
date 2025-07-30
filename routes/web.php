<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

use App\Models\Sale;
use App\Notifications\SaleStatusUpdated;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\AdminSalesController;
use App\Http\Controllers\AdminAgentController;
use App\Http\Controllers\AdminClientController;
use App\Http\Controllers\ClientDocumentController;
use App\Http\Controllers\ClientNoteController;
use App\Http\Controllers\DocumentFolderController;
use App\Http\Controllers\AgentDocumentController;
use App\Http\Controllers\AgentDocumentFolderController;
use App\Http\Controllers\AgentNoteController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\AgentSalesController;
use App\Http\Controllers\AgentClientController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminResourceController;
use App\Http\Controllers\AgentResourceController;
use App\Http\Controllers\ClientResourceController;
use App\Http\Controllers\ClientUpdateRequestController;
use App\Http\Controllers\ClientDashboardController;
use App\Http\Controllers\ClientSaleController;
use App\Http\Controllers\AdminCustomBroadcastController;
use App\Http\Controllers\AdminAdminDocumentController;
use App\Http\Controllers\SaleDocumentController;
use App\Http\Controllers\SaleNoteController;
use App\Http\Controllers\AdminEventController;
use App\Http\Controllers\AdminContactController;
use App\Http\Controllers\ContactLinkController;


// Main Route - Redirect Based on Role
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'agent') {
            return redirect()->route('agent.dashboard');
        } elseif ($user->role === 'client') {
            return redirect()->route('client.dashboard');
        }
        return Inertia::render('auth/no-dashboard', [
            'message' => 'Your account does not have an assigned role. Please contact support.'
        ]);
    }
    return Inertia::render('auth/login', [
        'status' => 'Please log in to access your account',
        'canResetPassword' => Route::has('password.request'),
    ]);
})->name('home');

// Shared notification routes & test endpoint
Route::middleware('auth')->group(function () {
    // Mark a single notification as read
    Route::post('notifications/{id}/read', [NotificationController::class, 'markRead'])
        ->name('notifications.read');

    // Mark all unread notifications as read
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])
        ->name('notifications.readAll');

    // Test route to fire a notification and redirect into the appropriate dashboard
    Route::get('/test-notif', function () {
        $sale = Sale::firstOrFail();
        auth()->user()->notify(new SaleStatusUpdated($sale));

        // Redirect based on the current user's role so Inertia will re-share notifications
        $role = auth()->user()->role;
        if ($role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($role === 'agent') {
            return redirect()->route('agent.dashboard');
        } elseif ($role === 'client') {
            return redirect()->route('client.dashboard');
        }
        return redirect()->route('home');
    })->name('test.notif');
});



// ✅ Admin Routes
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('admin/dashboard', [\App\Http\Controllers\AdminDashboardController::class, 'dashboard'])
        ->name('admin.dashboard');

        // routes/web.php

        Route::get  ('admin/settings/profile',  [\App\Http\Controllers\Settings\ProfileController::class, 'edit'  ])
        ->name('admin.settings.profile');
   Route::patch('profile',  [\App\Http\Controllers\Settings\ProfileController::class, 'update'])
        ->name('admin.profile.update');        Route::inertia('admin/settings/password',  'admin/settings/password')->name('admin.settings.password');
        Route::inertia('admin/settings/appearance','admin/settings/appearance')->name('admin.settings.appearance');

Route::get('admin/notifications', [NotificationController::class, 'index'])
     ->name('admin.notifications.index');

     Route::get ('admin/broadcasts'        , [AdminCustomBroadcastController::class,'index' ])->name('admin.broadcasts.index');
     Route::get ('admin/broadcasts/create' , [AdminCustomBroadcastController::class,'create'])->name('admin.broadcasts.create');
     Route::post('admin/broadcasts'        , [AdminCustomBroadcastController::class,'store' ])->name('admin.broadcasts.store');
     Route::delete('admin/broadcasts/{broadcast}', [AdminCustomBroadcastController::class,'destroy'])->name('admin.broadcasts.destroy');

    // Manage announcements
    Route::get('/admin/manage-announcements', [AnnouncementController::class, 'index'])
        ->name('admin.announcement.manage');
    Route::get('/admin/add-announcement', [AnnouncementController::class, 'create'])
        ->name('announcements.create');
    Route::post('/admin/announcements', [AnnouncementController::class, 'store'])
        ->name('announcements.store');
    Route::get('/admin/announcement/{announcement}/edit', [AnnouncementController::class, 'edit'])
        ->name('announcements.edit');
    Route::put('/admin/announcement/{announcement}', [AnnouncementController::class, 'update'])
        ->name('announcements.update');
    Route::delete('/admin/announcement/{announcement}', [AnnouncementController::class, 'destroy'])
        ->name('announcements.destroy');
    Route::post('/admin/announcements/upload', [AnnouncementController::class, 'upload'])
        ->name('announcements.upload');

    // Sales
    Route::get('admin/sales', [SaleController::class, 'adminSales'])->name('admin.sales');
    Route::get('admin/sales/create', [AdminSalesController::class, 'create'])->name('admin.sales.create');
    Route::post('admin/sales/store', [AdminSalesController::class, 'store'])->name('admin.sales.store');
    Route::get('admin/sales/carriers', [SaleController::class, 'getCarriers'])->name('admin.sales.carriers');
    Route::get('admin/sales/{sale}',      [AdminSalesController::class,'show'])->name('admin.sales.show');
Route::get('admin/sales/{sale}/edit', [AdminSalesController::class,'edit'])->name('admin.sales.edit');
Route::put('admin/sales/{sale}',      [AdminSalesController::class,'update'])->name('admin.sales.update');
Route::delete('admin/sales/{sale}', [AdminSalesController::class, 'destroy'])
    ->name('admin.sales.destroy');
    Route::put  ('/admin/sales/{sale}/check',  [AdminSalesController::class,'updateChecklist'])->name('admin.sales.checklist');
    /* ───────── Sale documents ──────── */
Route::post ('admin/sales/{sale}/documents',          [SaleDocumentController::class,'store' ])->name('admin.sales.documents.upload');
Route::delete('admin/sales/{sale}/documents/{document}',[SaleDocumentController::class,'destroy'])->name('admin.sales.documents.destroy');
/* ───────── Sale notes ──────────── */
Route::post ('admin/sales/{sale}/notes',             [SaleNoteController::class,'store'   ])->name('admin.sales.notes.store');
Route::delete('admin/sales/{sale}/notes/{note}',     [SaleNoteController::class,'destroy'])->name('admin.sales.notes.destroy');

     // Admin Calendar Page
    Route::get('admin/calendar', fn () => Inertia::render('admin/calendar'))->name('admin.calendar');


    Route::middleware(['auth', 'adminOrCalendarAgent'])
    ->prefix('admin/events')
    ->controller(AdminEventController::class)
    ->group(function () {
        Route::get('/', 'index');
        Route::post('/', 'store');
        Route::put('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
    });

/* ───────── Admin • Contacts ───────── */

Route::middleware(['auth', 'role:admin'])
     ->prefix('admin')
     ->as('admin.contacts.')
     ->controller(AdminContactController::class)
     ->group(function () {

    /* LIST */
    Route::get('/contacts', 'index')->name('index');

    /* CREATE */
    Route::get ('/contacts-create', 'create')->name('create');
    Route::post('/contacts',         'store') ->name('store');

    /* SHOW  ─ both paths map to the same method */
    Route::get('/contacts-show/{contact}', 'show')->name('show');
    Route::get('/contacts/{contact}',      'show');        // ← alias

    /* EDIT / DELETE */
    Route::put   ('/contacts/{contact}', 'update')->name('update');
    Route::delete('/contacts/{contact}', 'destroy')->name('destroy');

    /* CONVERSIONS */
    Route::post('/contacts/{contact}/convert-to-agent',  'convertToAgent')
        ->name('convertToAgent');
    Route::post('/contacts/{contact}/convert-to-client', 'convertToClient')
        ->name('convertToClient');

        // routes/web.php  (inside the admin/contacts group)
Route::get('/contacts-edit/{contact}', 'edit')   // ← real edit, when you build it
      ->name('edit');

// TEMP: while “edit” page isn’t built, forward to show so the UI doesn’t explode
Route::get('/contacts/{contact}/edit', 'show')   // ← keep old URL working too
      ->name('edit');                            // gives Ziggy its route name


      // Quick-note create
Route::post('/{contact}/history',  [AdminContactController::class,'storeHistory'])
     ->name('history.store');

     Route::get('/contacts/{contact}/edit', 'edit')->name('edit');

     Route::post('/contacts/{contact}/links',  [ContactLinkController::class,'store'])
     ->name('links.store');
Route::delete('/contacts/{contact}/links/{link}', [ContactLinkController::class,'destroy'])
     ->name('links.destroy');


});




    // Agents
    Route::get('admin/agents/create', [AdminAgentController::class, 'create'])->name('admin.agents.create');
    Route::post('admin/agents/store', [AdminAgentController::class, 'store'])->name('admin.agents.store');
    Route::get('admin/agents', [AdminAgentController::class, 'agents'])->name('admin.agents');
    Route::put('/admin/agents/{agent}/checklist', [AdminAgentController::class, 'updateChecklist'])
     ->name('admin.agents.checklist');
    Route::get('agents/{agent}/overview', [AdminAgentController::class, 'overview'])->name('admin.agents.overview');
    Route::get('agents/{agent}/edit', [AdminAgentController::class, 'edit'])->name('admin.agents.edit');
    Route::put('agents/{agent}', [AdminAgentController::class, 'update'])->name('admin.agents.update');
    Route::delete('agents/{agent}', [AdminAgentController::class, 'destroy'])->name('admin.agents.destroy');
    Route::post('agents/{agent}/documents/upload', [AgentDocumentController::class, 'store'])->name('admin.agents.documents.upload');
    Route::get('agents/{agent}/documents/{document}', [AgentDocumentController::class, 'show'])->name('admin.agents.documents.view');
    Route::delete('agents/{agent}/documents/{document}', [AgentDocumentController::class, 'destroy'])->name('admin.agents.documents.destroy');
    Route::post('agents/{agent}/documents/{document}/move', [AgentDocumentController::class, 'move'])->name('admin.agents.documents.move');
    Route::post('agents/{agent}/documents/{document}/rename', [AgentDocumentController::class, 'rename'])->name('admin.agents.documents.rename');
    Route::post('agents/{agent}/folders', [AgentDocumentFolderController::class, 'store'])->name('admin.agents.documents.folder.store');
    Route::delete('agents/documents/folder/{folder}', [AgentDocumentFolderController::class, 'destroy'])->name('admin.agents.documents.folder.destroy');
    Route::post('agents/documents/folder/{folder}/rename', [AgentDocumentFolderController::class, 'rename'])->name('admin.agents.documents.folder.rename');
    Route::post('agents/{agent}/notes', [AgentNoteController::class, 'store'])->name('admin.agents.notes.store');
    Route::delete('agents/{agent}/notes/{note}', [AgentNoteController::class, 'destroy'])->name('admin.agents.notes.destroy');
    Route::post('/admin/agents/{agent}/make-user', [AdminAgentController::class, 'makeUser'])
    ->name('admin.agents.makeUser')
    ->middleware(['auth']);


    // Clients
    Route::get('admin/clients', [AdminClientController::class, 'clients'])->name('admin.clients');
    Route::get('admin/clients/create', [AdminClientController::class, 'create'])->name('admin.clients.create');
    Route::post('admin/clients/store', [AdminClientController::class, 'store'])->name('admin.clients.store');
    Route::get('admin/clients/{client}/edit', [AdminClientController::class, 'edit'])->name('admin.clients.edit');
    Route::put('admin/clients/{client}', [AdminClientController::class, 'update'])->name('admin.clients.update');
    Route::delete('admin/clients/{client}', [AdminClientController::class, 'destroy'])->name('admin.clients.destroy');
    Route::get('admin/clients/{client}/overview', [AdminClientController::class, 'overview'])->name('admin.clients.overview');
    Route::post('admin/clients/{client}/documents/upload', [ClientDocumentController::class, 'store'])->name('admin.clients.documents.upload');
    Route::delete('admin/clients/{client}/documents/{document}', [ClientDocumentController::class, 'destroy'])->name('admin.clients.documents.destroy');
    Route::get('admin/clients/{client}/documents/{document}/view', [ClientDocumentController::class, 'show'])->name('admin.clients.documents.view');
    Route::post('admin/clients/{client}/documents/{document}/move', [ClientDocumentController::class, 'move'])->name('admin.clients.documents.move');
    Route::post('admin/clients/{client}/documents/{document}/rename', [ClientDocumentController::class, 'rename'])->name('admin.clients.documents.rename');
    Route::post('admin/clients/{client}/documents/folder', [DocumentFolderController::class, 'store'])->name('admin.clients.documents.folder.store');
    Route::delete('admin/clients/documents/folder/{folder}', [DocumentFolderController::class, 'destroy'])->name('admin.clients.documents.folder.destroy');
    Route::post('admin/clients/documents/folder/{folder}/rename', [DocumentFolderController::class, 'rename'])->name('admin.clients.documents.folder.rename');
    Route::post('admin/clients/{client}/notes/store', [ClientNoteController::class, 'store'])->name('admin.clients.notes.store');
    Route::delete('admin/clients/{client}/notes/{note}', [ClientNoteController::class, 'destroy'])->name('admin.clients.notes.destroy');
    // At the end of the Admin » Clients section:
Route::post(
    'admin/clients/{client}/make-user',
    [AdminClientController::class, 'createUser']
)->name('admin.clients.makeUser');
    // … existing agent routes …

    // Update client info (request)
    Route::put(
        'agent/clients/{client}',
        [AgentClientController::class, 'update']
    )->name('agent.clients.update');
    Route::get(
        'admin/client-update-requests',
        [ClientUpdateRequestController::class,'index']
    )->name('admin.client_update_requests.index');
    
    Route::post(
        'admin/client-update-requests/{updateRequest}/approve',
        [ClientUpdateRequestController::class,'approve']
      )->name('admin.client_update_requests.approve');
      
      Route::post(
        'admin/client-update-requests/{updateRequest}/reject',
        [ClientUpdateRequestController::class,'reject']
      )->name('admin.client_update_requests.reject');
      


    // Reports
    Route::get('admin/reports', [\App\Http\Controllers\AdminReportsController::class, 'index'])->name('admin.reports');
    Route::get('admin/reports/export', [\App\Http\Controllers\AdminReportsController::class, 'export'])->name('admin.reports.export');

    //Forms & Resources
    /* ---------- browser ---------- */
    Route::get('admin/forms-resources',               // ➜ pages/admin/forms-resources.tsx
        [AdminResourceController::class, 'index']
    )->name('admin.forms-resources');

   /* ─── Admin » Forms & Resources – extra actions ─────────────── */

// routes/web.php  (inside the admin group)
/* ---------- folders ---------- */
Route::post('admin/forms-resources/folders',             // create
    [AdminResourceController::class, 'storeFolder']
)->name('admin.resources.folders.store');

Route::post('admin/forms-resources/folders/{folder}/rename',
    [AdminResourceController::class, 'renameFolder']
)->name('admin.resources.folders.rename');

Route::post('admin/forms-resources/folders/{folder}/move',
    [AdminResourceController::class, 'moveFolder']        // <-- new
)->name('admin.resources.folders.move');

Route::delete('admin/forms-resources/folders/{folder}',
    [AdminResourceController::class, 'destroyFolder']
)->name('admin.resources.folders.destroy');


# documents
Route::post   ('admin/forms-resources/documents',                    // upload
[AdminResourceController::class, 'storeDocument']
)->name('admin.resources.documents.store');

Route::patch  ('admin/forms-resources/documents/{document}/toggle',  // publish / unpublish
[AdminResourceController::class, 'toggleDocument']
)->name('admin.resources.documents.toggle');

Route::post   ('admin/forms-resources/documents/{document}/move',    // move
[AdminResourceController::class, 'moveDocument']
)->name('admin.resources.documents.move');

Route::post   ('admin/forms-resources/documents/{document}/rename',  // rename
[AdminResourceController::class, 'renameDocument']
)->name('admin.resources.documents.rename');

Route::delete ('admin/forms-resources/documents/{document}',         // delete
[AdminResourceController::class, 'destroyDocument']
)->name('admin.resources.documents.destroy');

/* view / download a single document */
Route::get('admin/forms-resources/documents/{document}',
    [AdminResourceController::class,'show']
)->name('admin.forms-resources.show');


});

// Superadmin-only
Route::middleware(['auth', 'role:admin', 'superadmin'])->group(function () {
    // Admin management
    Route::get('admin/admins/create', [\App\Http\Controllers\AdminAdminController::class, 'create'])->name('admin.admins.create');
    Route::post('admin/admins/store', [\App\Http\Controllers\AdminAdminController::class, 'store'])->name('admin.admins.store');
    Route::get('admin/admins', [\App\Http\Controllers\AdminAdminController::class, 'admins'])->name('admin.admins');
    Route::get('admin/admins/{admin}/overview', [\App\Http\Controllers\AdminAdminController::class, 'overview'])->name('admin.admins.overview');
    Route::delete('admin/admins/{admin}', [\App\Http\Controllers\AdminAdminController::class, 'destroy'])->name('admin.admins.destroy');
    // PUT  /admin/admins/{admin}/super   →  toggle super-admin flag
Route::put(
    'admin/admins/{admin}/super',
    [App\Http\Controllers\AdminAdminController::class, 'toggleSuper']
)->name('admin.admins.toggleSuper');


    // Admin documents
// routes/web.php
Route::prefix('admin/admin-documents')
      ->name('admin.admin-documents.')
      ->middleware(['auth','role:admin'])
      ->group(function () {

    /* list & view */
    Route::get('/',                [AdminAdminDocumentController::class,'index'  ])->name('index');
    Route::get('{document}/view',  [AdminAdminDocumentController::class,'show'   ])->name('view');

    /* ─────── documents ─────── */
    Route::post('/',               [AdminAdminDocumentController::class,'store'  ])->name('store');
    Route::post('{document}/move', [AdminAdminDocumentController::class,'move'   ])->name('move');
    Route::post('{document}/rename',[AdminAdminDocumentController::class,'rename'])->name('rename');
    Route::delete('{document}',    [AdminAdminDocumentController::class,'destroy'])->name('destroy');

    /* ─────── folders ───────── */
    Route::post('folders',                [AdminAdminDocumentController::class,'storeFolder' ])->name('folders.store');
    Route::post('folders/{folder}/move',  [AdminAdminDocumentController::class,'moveFolder'  ])->name('folders.move');
    Route::post('folders/{folder}/rename',[AdminAdminDocumentController::class,'renameFolder'])->name('folders.rename');
    Route::delete('folders/{folder}',     [AdminAdminDocumentController::class,'destroyFolder'])->name('folders.destroy');
});

});

// ✅ Agent Routes
Route::middleware(['auth', 'role:agent'])->group(function () {
    Route::get('agent/notifications',         [NotificationController::class,'agentIndex'])->name('agent.notifications');
    Route::get('agent/notifications/{notification}', [NotificationController::class,'agentShow'])->name('agent.notifications.show');
    Route::put('agent/notifications/{notification}/read', [NotificationController::class,'agentRead'])->name('agent.notifications.read');
    Route::get('agent/dashboard', [\App\Http\Controllers\AgentDashboardController::class, 'dashboard'])->name('agent.dashboard');
    Route::get('agent/announcements', fn() => Inertia::render('agent/announcements'))->name('agent.announcements');
    Route::get(
        'agent/settings/profile',
        [\App\Http\Controllers\Settings\ProfileController::class, 'edit']
    )->name('agent.settings.profile');
    
    Route::patch(
        'agent/settings/profile',
        [\App\Http\Controllers\Settings\ProfileController::class, 'update']
    )->name('agent.profile.update');    Route::inertia('agent/settings/password',  'agent/settings/password')->name('agent.settings.password');
    Route::inertia('agent/settings/appearance','agent/settings/appearance')->name('agent.settings.appearance');

    // Agent Sales
    Route::get('agent/sales', [AgentSalesController::class, 'index'])->name('agent.sales');
    Route::get('agent/sales/carriers', [SaleController::class, 'getCarriers'])
    ->name('agent.sales.carriers');
        // Show “Add Sale” form for agents
Route::get('agent/sales/create', [AgentSalesController::class, 'create'])
->name('agent.sales.create');
    Route::get('agent/sales/{sale}', [AgentSalesController::class, 'show'])->name('agent.sales.show');



// Handle sale submission
Route::post('agent/sales', [AgentSalesController::class, 'store'])
->name('agent.sales.store');


// Agent – Clients
Route::get('agent/clients',                   [AgentClientController::class,'clients'])
     ->name('agent.clients');
Route::get('agent/clients/create',            [AgentClientController::class,'create'])
     ->name('agent.clients.create');
Route::post('agent/clients/store',            [AgentClientController::class,'store'])
     ->name('agent.clients.store');
Route::get('agent/clients/{client}/overview', [AgentClientController::class,'overview'])
     ->name('agent.clients.overview');
     Route::post(
        'agent/clients/{client}/documents/upload',
        [ClientDocumentController::class, 'store']
    )->name('agent.clients.documents.upload');

    Route::put('agent/clients/{client}',          [AgentClientController::class,'update'])
     ->name('agent.clients.update');

    Route::get('agent/edit-sales', fn() => Inertia::render('agent/edit-sales'))->name('agent.edit-sales');

    Route::get('agent/forms-resources',               // ➜ pages/agent/forms-resources.tsx
        [AgentResourceController::class, 'index']
    )->name('agent.forms-resources');

    Route::get('agent/forms-resources/documents/{document}',   // file view / download
        [AgentResourceController::class, 'show']
    )->name('agent.forms-resources.show');
});

// ✅ Client Routes
Route::middleware(['auth', 'role:client'])->group(function () {
    Route::get('client/notifications',         [NotificationController::class,'clientIndex'])->name('client.notifications');
    Route::get('client/notifications/{notification}', [NotificationController::class,'clientShow'])->name('client.notifications.show');
    Route::put('client/notifications/{notification}/read', [NotificationController::class,'clientRead'])->name('client.notifications.read');
    Route::get(
        'client/dashboard',
        [ClientDashboardController::class, 'dashboard']
    )->name('client.dashboard');    Route::get('client/forms-resources',              // ➜ pages/client/forms-resources.tsx
        [ClientResourceController::class, 'index']
    )->name('client.forms-resources');
    Route::get(
        'client/sales/{sale}',
        [ClientSaleController::class,'show']
    )->name('client.sales.show');
    Route::get(
        'client/sales/{sale}',
        [ClientSaleController::class, 'show']
    )->name('client.sales.show');
    Route::get('client/forms-resources/documents/{document}',  // file view / download
        [ClientResourceController::class, 'show']
    )->name('client.forms-resources.show');

    Route::get  ('client/settings/profile',  [\App\Http\Controllers\Settings\ProfileController::class, 'edit'  ])
         ->name('client.settings.profile');
    Route::patch('profile',  [\App\Http\Controllers\Settings\ProfileController::class, 'update'])
         ->name('client.profile.update');    Route::inertia('client/settings/password',  'settings/client/password')->name('client.settings.password');
    Route::inertia('client/settings/appearance','settings/client/appearance')->name('client.settings.appearance');

});

// Example addition (if ever needed)
Route::get('agent/dashboard2', fn() => Inertia::render('agent/dashboard2'))->name('agent.dashboard2');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
