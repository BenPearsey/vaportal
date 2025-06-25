// resources/js/pages/agent/client-overview.tsx
import React, { useState } from 'react';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';

interface Client {
  client_id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  dob?: string;
  status: string;
}

interface Sale {
  sale_id: number;
  product: string;
  total_sale_amount: number;
  commission: number;
  status: string;
  sale_date: string;
  carrier_info?: { name: string };
}

export default function ClientOverview() {
  const { client, sales }: { client: Client; sales: Sale[] } = usePage().props as any;

  const saleTypeLabels: Record<string,string> = {
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

  // currency formatter with commas and dollar sign
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  // ── Update Client Info ───────────────────────────
  const { data, setData, put, processing, errors, reset } = useForm({
    email: client.email,
    phone: client.phone || '',
    address: client.address || '',
    city: client.city || '',
    state: client.state || '',
    zipcode: client.zipcode || '',
  });

  const submitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('agent.clients.update', client.client_id), {
      onSuccess: () => {
        toast.success('Update request sent. Pending admin approval.');
        reset('address', 'city', 'state', 'zipcode', 'phone', 'email');
      },
      onError: () => {
        toast.error('Failed to send update request.');
      }
    });
  };

  // ── Upload Document ──────────────────────────────
  const [file, setFile]     = useState<File|null>(null);
  const [title, setTitle]   = useState('');
  const [uploading, setUploading] = useState(false);

  const submitUpload = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    setUploading(true);
    router.post(
      route('agent.clients.documents.upload', client.client_id),
      fd,
      {
        onSuccess: () => {
          toast.success('Document uploaded and admin notified.');
          setFile(null);
          setTitle('');
        },
        onError: () => {
          toast.error('Upload failed.');
        },
        onFinish: () => setUploading(false),
      }
    );
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Clients', href: route('agent.clients') },
      { title: 'Overview', href: '' },
    ]}>
      <Head title={`Client: ${client.firstname} ${client.lastname}`} />

      {/* Client Info */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          <p><strong>Name:</strong> {client.firstname} {client.lastname}</p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Phone:</strong> {client.phone || '—'}</p>
          <p><strong>Status:</strong> {client.status}</p>
          <p><strong>Address:</strong> {client.address || '—'}</p>
          <p><strong>City:</strong> {client.city || '—'}</p>
          <p><strong>State:</strong> {client.state || '—'}</p>
          <p><strong>Zip:</strong> {client.zipcode || '—'}</p>
          <p><strong>DOB:</strong> {client.dob || '—'}</p>
        </CardContent>
      </Card>

      {/* Update Client Info Form */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Request Info Update</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submitUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <Input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <Input
                type="tel"
                value={data.phone}
                onChange={e => setData('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
            <div>
              <label className="block mb-1 font-medium">Address</label>
              <Input
                value={data.address}
                onChange={e => setData('address', e.target.value)}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1 font-medium">City</label>
                <Input
                  value={data.city}
                  onChange={e => setData('city', e.target.value)}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">State</label>
                <Input
                  value={data.state}
                  onChange={e => setData('state', e.target.value)}
                />
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">Zip Code</label>
                <Input
                  value={data.zipcode}
                  onChange={e => setData('zipcode', e.target.value)}
                />
                {errors.zipcode && <p className="text-red-500 text-sm">{errors.zipcode}</p>}
              </div>
            </div>
            <Button type="submit" disabled={processing}>
              {processing ? 'Sending...' : 'Submit Update Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upload Document */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  setTitle(f.name);
                }
              }}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Title (optional)</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Document Title"
            />
          </div>
          <Button onClick={submitUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload & Notify Admin'}
          </Button>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader><CardTitle>Sales for {client.firstname}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale #</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(s => (
                <TableRow key={s.sale_id}>
                  <TableCell>{s.sale_id}</TableCell>
                  <TableCell>{saleTypeLabels[s.product] || s.product}</TableCell>
                  <TableCell>{s.carrier_info?.name || '—'}</TableCell>
                  <TableCell>{currencyFormatter.format(s.total_sale_amount)}</TableCell>
                  <TableCell>{currencyFormatter.format(s.commission)}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>{s.sale_date}</TableCell>
                  <TableCell>
                    <Link href={route('agent.sales.show', s.sale_id)}>
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
