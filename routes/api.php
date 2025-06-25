<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AgentController;


Route::get('test', function () {
    return response()->json(['message' => 'API is working']);
});

    // Endpoint to update or create a client
    Route::post('client/update', [ClientController::class, 'updateOrStore']);
    
    // Endpoint to update or create an agent
    Route::post('agent/update', [AgentController::class, 'updateOrStore']);

Route::middleware('auth:sanctum')->group(function () {
    // Returns the authenticated user data
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    

});
