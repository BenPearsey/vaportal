// resources/js/pages/admin/sales/EditSale.tsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';

type Agent   = { id: number; firstname: string; lastname: string };
type Client  = { id: number; firstname: string; lastname: string };
type Carrier = { id: number; name: string };

interface EditSaleProps {
  sale: {
    sale_id: number;
    agent_id: number;
    client_id: number;
    carrier_info?: { id: number; name: string };
    product: string;
    total_sale_amount: number;
    commission: number;
    status: string;
    sale_date: string; // YYYY-MM-DD
  };
  agents: Agent[];
  clients: Client[];
  carriers: Carrier[];
  products: string[];
  statuses: string[];
}

export default function EditSale({
  sale,
  agents,
  clients,
  carriers,
  products,
  statuses,
}: EditSaleProps) {
  const form = useForm({
    agent_id: String(sale.agent_id),
    client_id: String(sale.client_id),
    product: sale.product,
    carrier: sale.carrier_info?.id ? String(sale.carrier_info.id) : '',
    total_sale_amount: sale.total_sale_amount,
    commission: sale.commission,
    sale_date: sale.sale_date,
    status: sale.status,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    form.put(route('admin.sales.update', sale.sale_id), {
      onSuccess: () => {
        // optional toast
      },
    });
  }

  const crumbs: BreadcrumbItem[] = [
    { title: 'Home',  href: route('admin.dashboard') },
    { title: 'Sales', href: route('admin.sales') },
    { title: `Edit Sale #${sale.sale_id}`, href: '' },
  ];

  return (
    <AppLayout breadcrumbs={crumbs}>
      <Head title={`Edit Sale #${sale.sale_id}`} />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {/* Agent */}
              <div>
                <Label>Agent</Label>
                <Select
                  value={form.data.agent_id}
                  onValueChange={v => form.setData('agent_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.firstname} {a.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.agent_id && (
                  <p className="text-red-600">{form.errors.agent_id}</p>
                )}
              </div>

              {/* Client */}
              <div>
                <Label>Client</Label>
                <Select
                  value={form.data.client_id}
                  onValueChange={v => form.setData('client_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.firstname} {c.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.client_id && (
                  <p className="text-red-600">{form.errors.client_id}</p>
                )}
              </div>

              {/* Product */}
              <div>
                <Label>Product</Label>
                <Select
                  value={form.data.product}
                  onValueChange={v => form.setData('product', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.product && (
                  <p className="text-red-600">{form.errors.product}</p>
                )}
              </div>

              {/* Carrier (optional) */}
              <div>
                <Label>Carrier</Label>
                <Select
                  value={form.data.carrier}
                  onValueChange={v => form.setData('carrier', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.carrier && (
                  <p className="text-red-600">{form.errors.carrier}</p>
                )}
              </div>

              {/* Amount & Commission */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Sale Amount</Label>
                  <Input
                    type="number"
                    value={String(form.data.total_sale_amount)}
                    onChange={e =>
                      form.setData('total_sale_amount', e.currentTarget.value)
                    }
                  />
                  {form.errors.total_sale_amount && (
                    <p className="text-red-600">
                      {form.errors.total_sale_amount}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Commission</Label>
                  <Input
                    type="number"
                    value={String(form.data.commission)}
                    onChange={e =>
                      form.setData('commission', e.currentTarget.value)
                    }
                  />
                  {form.errors.commission && (
                    <p className="text-red-600">{form.errors.commission}</p>
                  )}
                </div>
              </div>

              {/* Sale Date */}
              <div>
                <Label>Sale Date</Label>
                <Input
                  type="date"
                  value={form.data.sale_date}
                  onChange={e => form.setData('sale_date', e.currentTarget.value)}
                />
                {form.errors.sale_date && (
                  <p className="text-red-600">{form.errors.sale_date}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select
                  value={form.data.status}
                  onValueChange={v => form.setData('status', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.status && (
                  <p className="text-red-600">{form.errors.status}</p>
                )}
              </div>

              <div className="text-right">
                <Button type="submit" disabled={form.processing}>
                  {form.processing ? 'Updating…' : 'Update Sale'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
