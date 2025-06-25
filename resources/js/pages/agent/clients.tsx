import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card, CardHeader, CardTitle, CardContent
} from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { EyeIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Client {
  client_id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  status: string;
}

export default function Clients() {
  const { clients, statuses, selected } = usePage<{
    clients: Client[];
    statuses: string[];
    selected: { search: string; status: string };
  }>().props;

  const [search, setSearch]   = useState(selected.search);
  const [status, setStatus]   = useState(selected.status);

  // filter logic
  const filtered = clients.filter(c => {
    const matchesStatus = status === 'All' || c.status === status;
    const term = search.toLowerCase();
    const matchesSearch =
      c.firstname.toLowerCase().includes(term) ||
      c.lastname.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <AppLayout breadcrumbs={[
      { title: 'Clients', href: route('agent.clients') }
    ]}>
      <Head title="My Clients" />

      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          className="w-full md:w-1/3"
        />

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {status}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatus('All')}>
                All
              </DropdownMenuItem>
              {statuses.map(s => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={route('agent.clients.create')}>
            <Button>Add Client</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Clients</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.client_id}>
                  <TableCell>
                    {c.firstname} {c.lastname}
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || '—'}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>
                    <Link href={route('agent.clients.overview', c.client_id)}>
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="h-5 w-5" />
                      </Button>
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
