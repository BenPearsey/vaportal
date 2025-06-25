// resources/js/pages/agent/sale-overview.tsx
import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { BreadcrumbItem } from '@/types';

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

interface Client {
  client_id: number;
  firstname: string;
  lastname: string;
}

interface Carrier {
  id: number;
  name: string;
}

interface Sale {
  sale_id: number;
  product: string;
  total_sale_amount: number;
  commission: number;
  status: string;
  sale_date: string;
  funds_received: number;
  client: Client;
  carrier_info?: Carrier;    // <-- note snake_case
}

interface Props {
  sale: Sale;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Sales', href: route('agent.sales') },
  { title: 'Sale Overview', href: '#' },
];

export default function SaleOverview() {
  const { sale } = usePage<Props>().props;
  const backUrl = route('agent.sales');

  // currency formatter with commas
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Sale #${sale.sale_id}`} />

      <div className="p-4 flex flex-col gap-4">
        {/* Back link */}
        <Link
          href={backUrl}
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sales
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Sale ID</TableCell>
                  <TableCell>{sale.sale_id}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Client</TableCell>
                  <TableCell>
                    <Link
                      href={route('agent.clients.overview', sale.client.client_id)}
                      className="text-primary hover:underline"
                    >
                      {sale.client.firstname} {sale.client.lastname}
                    </Link>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Product</TableCell>
                  <TableCell>
                    {saleTypeLabels[sale.product] ?? sale.product}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Amount</TableCell>
                  <TableCell>
                    {currencyFormatter.format(sale.total_sale_amount)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Commission</TableCell>
                  <TableCell>
                    {currencyFormatter.format(sale.commission)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Carrier</TableCell>
                  <TableCell>{sale.carrier_info?.name ?? '—'}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Status</TableCell>
                  <TableCell>{sale.status}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Sale Date</TableCell>
                  <TableCell>{sale.sale_date}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-medium">Funds Received</TableCell>
                  <TableCell>
                    {currencyFormatter.format(sale.funds_received)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
