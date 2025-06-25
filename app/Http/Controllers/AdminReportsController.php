<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Admin;
use App\Models\Agent;
use App\Models\Client;
use Inertia\Inertia;

class AdminReportsController extends Controller
{
    /**
     * Display the reports dashboard.
     */
    public function index(Request $request)
    {
        // Get optional date filters from query parameters.
        $startDate = $request->query('start_date');
        $endDate   = $request->query('end_date');

        // Build the sales query using the date range if provided.
        $salesQuery = Sale::query();
        if ($startDate) {
            $salesQuery->whereDate('sale_date', '>=', $startDate);
        }
        if ($endDate) {
            $salesQuery->whereDate('sale_date', '<=', $endDate);
        }
        
        // Retrieve sales and aggregate data.
        $sales = $salesQuery->get();
        $totalSales = $sales->count();
        $totalRevenue = $sales->sum('total_sale_amount');
        $totalCommissions = $sales->sum('commission');

        // Count users by role.
        $totalAdmins  = Admin::count();
        $totalAgents  = Agent::count();
        $totalClients = Client::count();

        // Aggregate sales by month for the current year.
        $salesByMonth = $salesQuery->selectRaw('MONTH(sale_date) as month, COUNT(*) as sales_count, SUM(total_sale_amount) as revenue, SUM(commission) as commission')
            ->whereYear('sale_date', date('Y'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Cast revenue and commission to floats (and default nulls to 0)
        $salesByMonth = $salesByMonth->map(function ($row) {
            $row->revenue = $row->revenue !== null ? (float)$row->revenue : 0;
            $row->commission = $row->commission !== null ? (float)$row->commission : 0;
            return $row;
        });

        $reportData = [
            'totalSales'       => $totalSales,
            'totalRevenue'     => $totalRevenue,
            'totalCommissions' => $totalCommissions,
            'totalAdmins'      => $totalAdmins,
            'totalAgents'      => $totalAgents,
            'totalClients'     => $totalClients,
            'salesByMonth'     => $salesByMonth,
            'start_date'       => $startDate,
            'end_date'         => $endDate,
        ];

        return Inertia::render('admin/reports', ['reportData' => $reportData]);
    }

    /**
     * Export the sales data as CSV.
     */
    public function export(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate   = $request->query('end_date');

        $salesQuery = Sale::query();
        if ($startDate) {
            $salesQuery->whereDate('sale_date', '>=', $startDate);
        }
        if ($endDate) {
            $salesQuery->whereDate('sale_date', '<=', $endDate);
        }

        $sales = $salesQuery->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="reports.csv"',
        ];

        $columns = ['Sale ID', 'Sale Date', 'Total Amount', 'Commission'];

        $callback = function () use ($sales, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($sales as $sale) {
                fputcsv($file, [
                    $sale->id,
                    $sale->sale_date,
                    $sale->total_sale_amount,
                    $sale->commission,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    
}
