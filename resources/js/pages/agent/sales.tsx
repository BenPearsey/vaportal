// resources/js/pages/agent/sales.tsx
import React, { useState, useEffect } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Filter, Eye } from 'lucide-react';

// —— reuse your admin’s product labels —— 
const saleTypeLabels: Record<string, string> = {
  trust: "Trust",
  precious_metals: "Precious Metals",
  term_life: "Term Life",
  iul: "IUL",
  whole_life: "Whole Life",
  annuity: "Annuity",
  final_expense: "Final Expense",
  "10_term": "10 Term",
  "20_term": "20 Term",
  "30_term": "30 Term",
};

interface Client { firstname: string; lastname: string; }
interface Carrier { id: number; name: string; }
interface Sale {
  sale_id: number;
  client: Client;
  product: string;
  total_sale_amount: number;
  status: string;
  sale_date: string;
  carrier_info?: Carrier;
}
interface Stats { totalSales: number; pending: number; completed: number; }
interface Filters {
  statuses: string[];
  products: string[];
  carriers: { id: number | 'All'; name: string }[];
}
interface Selected { status?: string; product?: string; carrier?: number | 'All'; search?: string; }

export default function Sales() {
  const { sales, stats, filters, selected } = usePage<{
    sales: any;
    stats: Stats;
    filters: Filters;
    selected: Selected;
  }>().props;

  const [search, setSearch]   = useState(selected.search || '');
  const [status, setStatus]   = useState(selected.status || 'All');
  const [product, setProduct] = useState(selected.product || 'All');
  const [carrier, setCarrier] = useState<Selected['carrier']>(selected.carrier ?? 'All');

  // currency formatter with commas
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  // re-fetch on filter change
  useEffect(() => {
    router.get(route('agent.sales'), { search, status, product, carrier }, {
      preserveState: true,
      replace: true,
    });
  }, [search, status, product, carrier]);

  return (
    <AppLayout breadcrumbs={[{ title: 'Sales', href: route('agent.sales') }]}>
      <Head title="Agent Sales" />

      <div className="flex flex-col gap-4 p-4">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Total Sales</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">
              {stats.totalSales.toLocaleString()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pending Sales</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">
              {stats.pending.toLocaleString()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Completed Sales</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">
              {stats.completed.toLocaleString()}
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex justify-between gap-4">
          <Input
            placeholder="Search by Client…"
            value={search}
            onChange={e => setSearch(e.currentTarget.value)}
            className="max-w-sm"
          />

<div className="flex gap-2 items-center">
            {/* NEW: Submit Sale button */}
            <Button
              onClick={() => router.get(route('agent.sales.create'))}
            >
              Submit Sale
            </Button>



            {/* Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" /> Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filters.statuses.map(s => (
                  <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                    {s}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Product */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" /> Product
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filters.products.map(p => (
                  <DropdownMenuItem key={p} onClick={() => setProduct(p)}>
                    {saleTypeLabels[p] ?? p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Carrier */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" /> Carrier
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filters.carriers.map(c => (
                  <DropdownMenuItem key={c.id} onClick={() => setCarrier(c.id)}>
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sales Table */}
        <div className="border rounded-xl p-4 bg-white shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.data.map((sale: Sale) => (
                <TableRow key={sale.sale_id}>
                  <TableCell>{sale.sale_id}</TableCell>
                  <TableCell>
                    {sale.client.firstname} {sale.client.lastname}
                  </TableCell>
                  <TableCell>
                    {saleTypeLabels[sale.product] ?? sale.product}
                  </TableCell>
                  <TableCell>
                    {sale.carrier_info?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    {currencyFormatter.format(sale.total_sale_amount)}
                  </TableCell>
                  <TableCell>{sale.status}</TableCell>
                  <TableCell>{sale.sale_date}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={route('agent.sales.show', sale.sale_id)}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            {sales.links.map((link: any, i: number) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => link.url && router.get(link.url, {}, {
                  preserveState: true,
                  replace: true,
                })}
                className={`px-3 py-1 mx-1 rounded ${
                  link.active ? 'bg-primary text-white' : 'bg-gray-100'
                }`}
              >
                {link.label.replace(/&laquo;|&raquo;/g, '')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
