import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SaleOverview() {
  const { sale } = usePage<{ sale: any }>().props;

  return (
    <AppLayout>
      <Head title={`Sale #${sale.sale_id}`} />

      <Card className="m-6 max-w-xl">
        <CardHeader><CardTitle>{sale.product}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Status:</strong> {sale.status}</p>
          <p><strong>Issue Date:</strong> {sale.issue_date ?? '—'}</p>
          {sale.agent && (
            <>
              <p className="font-semibold pt-2">Writing Agent</p>
              <p>{sale.agent.firstname} {sale.agent.lastname}</p>
              {sale.agent.phone && <p>{sale.agent.phone}</p>}
              {sale.agent.email && (
                <p>
                  <a href={`mailto:${sale.agent.email}`} className="text-blue-600 hover:underline">
                    {sale.agent.email}
                  </a>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
