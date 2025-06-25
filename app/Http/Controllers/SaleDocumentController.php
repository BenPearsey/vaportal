<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\SaleDocument;
use Illuminate\Support\Facades\Storage; 

class SaleDocumentController extends Controller
{
    public function store(Request $r, Sale $sale)
    {
        $r->validate(['file'=>'required|file','title'=>'nullable']);
        $path = $r->file('file')->store("sales/{$sale->sale_id}");
        $sale->documents()->create([
            'title' => $r->title,
            'path'  => $path,
            'folder_id' => $r->folder_id ?: null,
        ]);
        return back();
    }
    public function destroy(Sale $sale, SaleDocument $document)
    {
        Storage::delete($document->path);
        $document->delete();
        return back();
    }
    // move / rename identical to client controller…
}

