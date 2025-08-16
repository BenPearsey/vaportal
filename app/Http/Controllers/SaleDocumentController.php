<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SaleDocumentController extends Controller
{
    /** Find the file on any of the likely disks and return [diskName, disk, relativePath] */
    protected function locate(string $rawPath, ?Sale $sale = null): array
    {
        // Normalize slashes and strip accidental 'storage/' prefix
        $relative = ltrim(str_replace('\\', '/', $rawPath), '/');
        $relative = preg_replace('#^storage/#', '', $relative);

        $candidates = [$relative];

        // Fallback: sometimes uploads end up without the 'checklist' folder
        if ($sale) {
            $basename = basename($relative);
            $maybe = "sales/{$sale->sale_id}/{$basename}";
            if ($maybe !== $relative) {
                $candidates[] = $maybe;
            }
        }

        foreach (['public', 'private', 'local'] as $diskName) {
            $disk = Storage::disk($diskName);
            foreach ($candidates as $path) {
                if ($disk->exists($path)) {
                    return [$diskName, $disk, $path];
                }
            }
        }

        return [null, null, null];
    }

    /** Inline view (PDF/images open in browser) */
    public function show(Request $request, Sale $sale, SaleDocument $document)
    {
        abort_unless((int)$document->sale_id === (int)$sale->sale_id, 404);

        [$diskName, $disk, $path] = $this->locate($document->path, $sale);
        abort_if(!$disk || !$path, 404, 'Document file not found.');

        $mime     = $disk->mimeType($path) ?: 'application/octet-stream';
        $filename = $document->title ?: basename($path);
        $stream   = $disk->readStream($path);
        abort_if($stream === false, 404, 'Unable to read file.');

        return response()->stream(function () use ($stream) {
            fpassthru($stream);
            is_resource($stream) && fclose($stream);
        }, 200, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'Cache-Control'       => 'private, max-age=0, must-revalidate',
            // helpful one-time debug:
            'X-VA-Disk'           => $diskName,
            'X-VA-Path'           => $path,
        ]);
    }

    /** Download endpoint (optional) */
    public function download(Request $request, Sale $sale, SaleDocument $document)
    {
        abort_unless((int)$document->sale_id === (int)$sale->sale_id, 404);

        [$diskName, $disk, $path] = $this->locate($document->path, $sale);
        abort_if(!$disk || !$path, 404);

        $name = $document->title ?: basename($path);
        return $disk->download($path, $name);
    }
}
