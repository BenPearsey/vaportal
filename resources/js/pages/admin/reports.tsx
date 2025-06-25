// resources/js/pages/admin/reports.tsx
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';

interface SalesByMonth {
  month: number;
  sales_count: number;
  revenue: number;
  commission: number;
}

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalCommissions: number;
  totalAdmins: number;
  totalAgents: number;
  totalClients: number;
  salesByMonth: SalesByMonth[];
  start_date?: string | null;
  end_date?: string | null;
}

export default function Reports() {
  const { reportData } = usePage().props as { reportData: ReportData };

  // Breadcrumbs for the Reports page.
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "Home", href: "/admin/dashboard" },
    { title: "Reports", href: "/admin/reports" },
  ];

  // State for filtering dates.
  const [startDate, setStartDate] = useState<string>(reportData.start_date || '');
  const [endDate, setEndDate] = useState<string>(reportData.end_date || '');

  const filterReports = () => {
    router.get(route('admin.reports'), { start_date: startDate, end_date: endDate }, { preserveState: true });
  };

  // Build the export URL with current filters.
  const exportCSVUrl = route('admin.reports.export', { start_date: startDate, end_date: endDate });

  // Formatter for currency with commas
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reports" />
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        
        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block mb-1">Start Date</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <Button onClick={filterReports}>Filter</Button>
          </div>
          <div>
            <a href={exportCSVUrl}>
              <Button variant="outline">Export CSV</Button>
            </a>
          </div>
        </div>
        
        <Separator />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{reportData.totalSales}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {currencyFormatter.format(reportData.totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {currencyFormatter.format(reportData.totalCommissions)}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{reportData.totalAdmins}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{reportData.totalAgents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{reportData.totalClients}</p>
            </CardContent>
          </Card>
        </div>
        
        <Separator />

        {/* Sales by Month Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Month (Current Year)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.salesByMonth.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.sales_count}</TableCell>
                    <TableCell>{currencyFormatter.format(row.revenue)}</TableCell>
                    <TableCell>{currencyFormatter.format(row.commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
