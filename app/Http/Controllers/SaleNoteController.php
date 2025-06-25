<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\SaleNote;
class SaleNoteController extends Controller
{
    public function store(Request $r, Sale $sale)
    {
        $r->validate(['content'=>'required|string']);
        $sale->notes()->create([
            'content'    => $r->content,
            'created_by' => auth()->user()->name ?? 'Admin',
        ]);
        return back();
    }
    public function destroy(Sale $sale, SaleNote $note)
    {
        $note->delete();
        return back();
    }
}

