import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function CreateClient() {
  const form = useForm({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    dob: '',
    status: 'Prospect',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('agent.clients.store'));
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Clients', href: route('agent.clients') },
      { title: 'Add Client', href: '' }
    ]}>
      <Head title="Add Client" />

      <Card>
        <CardHeader><CardTitle>Add Client</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={form.data.firstname}
                  onChange={e => form.setData('firstname', e.target.value)}
                />
                {form.errors.firstname && <p className="text-red-600">{form.errors.firstname}</p>}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={form.data.lastname}
                  onChange={e => form.setData('lastname', e.target.value)}
                />
                {form.errors.lastname && <p className="text-red-600">{form.errors.lastname}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.data.email}
                  onChange={e => form.setData('email', e.target.value)}
                />
                {form.errors.email && <p className="text-red-600">{form.errors.email}</p>}
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.data.phone}
                  onChange={e => form.setData('phone', e.target.value)}
                />
                {form.errors.phone && <p className="text-red-600">{form.errors.phone}</p>}
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                value={form.data.address}
                onChange={e => form.setData('address', e.target.value)}
              />
              {form.errors.address && <p className="text-red-600">{form.errors.address}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={form.data.city}
                  onChange={e => form.setData('city', e.target.value)}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={form.data.state}
                  onChange={e => form.setData('state', e.target.value)}
                />
              </div>
              <div>
                <Label>Zip Code</Label>
                <Input
                  value={form.data.zipcode}
                  onChange={e => form.setData('zipcode', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.data.dob}
                  onChange={e => form.setData('dob', e.target.value)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={form.data.status}
                  onChange={e => form.setData('status', e.target.value)}
                  className="mt-1 block w-full border rounded p-2"
                >
                  <option>Prospect</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                {form.errors.status && <p className="text-red-600">{form.errors.status}</p>}
              </div>
            </div>

            <div className="text-right">
              <Button type="submit" disabled={form.processing}>
                {form.processing ? 'Saving…' : 'Add Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
