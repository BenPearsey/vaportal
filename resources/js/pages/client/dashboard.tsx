import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ReadOnlySlate } from '@/components/ReadOnlySlate';
import VideoPlayer from '@/components/VideoPlayer';
import SalesProgressShelf from '@/components/SalesProgressShelf';
import { productLabel } from '@/lib/products'; // ✅ your label helper

type Announcement = {
  id?: number;
  type: 'text' | 'image' | 'video';
  title: string;
  content: string;
  description?: string;
};

type ProductRow = {
  sale_id: number;
  product: string;
  sale_date?: string | null;
  status?: string | null;
};

type AlertRow = {
  sale_id: number;
  product: string;
  anniversary: string;
};

type ClientDashboardProps = {
  announcements: Announcement[];
  products: ProductRow[];
  alerts: AlertRow[];
  agent?: { firstname?: string; lastname?: string; phone?: string; email?: string } | null;
};

const BIG_FIVE_STAGE_KEYS = ['application','payment','certificate','county','carrier'];

function fmtShortDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.split('T')[0] ?? iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
}

export default function ClientDashboard() {
  const { announcements, products, alerts, agent } = usePage<ClientDashboardProps>().props;

  return (
    <AppLayout>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 p-4">

        {/* 🔹 Show ALL of the client's sales as progress cards */}
        <SalesProgressShelf
          role="client"
          onlyStageKeys={BIG_FIVE_STAGE_KEYS}
          showCompleteOnce
          hideCompleted={false} // set true to hide 100% rows after showing once
        />

        {/* Announcements */}
        <div>
          <h2 className="text-xl font-bold">Announcements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements?.length ? (
              announcements.map((a) => (
                <Card key={a.id} className="relative overflow-hidden">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-2">
                    {a.type === 'video' ? (
                      <div className="rounded-xl overflow-hidden">
                        <VideoPlayer src={a.content} />
                      </div>
                    ) : a.type === 'image' ? (
                      <AspectRatio ratio={16 / 9}>
                        <img src={a.content} alt={a.title} className="w-full h-full object-cover rounded-xl" />
                      </AspectRatio>
                    ) : (
                      <ReadOnlySlate key={`${a.id}-content`} jsonString={a.content} />
                    )}
                    {a.description && a.type !== 'text' && (
                      <div className="mt-2">
                        <ReadOnlySlate key={`${a.id}-description`} jsonString={a.description} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No announcements available.</p>
            )}
          </div>
        </div>

        {/* My Products */}
        <div className="border rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">My Products</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Issue Date</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {products?.length ? (
                  products.map((p) => (
                    <tr key={p.sale_id} className="border-t">
                      <td className="py-2 pr-4">{productLabel(p.product)}</td>
                      <td className="py-2 pr-4">{fmtShortDate(p.sale_date)}</td>
                      <td className="py-2 pr-4">{p.status ?? '—'}</td>
                      <td className="py-2 pr-4">
<Link href={`/client/sales/${p.sale_id}`} className="text-primary hover:underline">
  View
</Link>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-4 text-muted-foreground" colSpan={4}>
                      No products yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optional: Upcoming index‑reallocation reminders */}
        {alerts?.length ? (
          <div className="border rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Upcoming Anniversaries</h2>
            <ul className="text-sm list-disc pl-5 space-y-1">
              {alerts.map((a) => (
                <li key={`${a.sale_id}-${a.anniversary}`}>
                  {productLabel(a.product)} — {fmtShortDate(a.anniversary)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
