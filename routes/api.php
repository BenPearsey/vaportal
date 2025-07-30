<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\PeopleController;



Route::get('test', function () {
    return response()->json(['message' => 'API is working']);
});

    // Endpoint to update or create a client
    Route::post('client/update', [ClientController::class, 'updateOrStore']);
    
    // Endpoint to update or create an agent
    Route::post('agent/update', [AgentController::class, 'updateOrStore']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $r) => $r->user());

    /* live-search endpoint for the participant picker  */
    Route::get('/admin/people', [PeopleController::class, 'index']);
    

});
