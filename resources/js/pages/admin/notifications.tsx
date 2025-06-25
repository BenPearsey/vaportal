import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BreadcrumbItem } from '@/types';

interface Props {
  notifications: {
    data: Array<{
      id: string;
      type: string;
      data: { message: string; url?: string };
      read_at: string|null;
      created_at: string;
    }>;
    links: any[];
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/admin/dashboard' },
  { title: 'Notifications', href: '/admin/notifications' },
];

export default function AdminNotifications({ notifications }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className="p-4">
        <Card>
          <CardHeader><CardTitle>All Notifications</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.data.map(n => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <a href={n.data.url ?? '#'} className="flex-1 text-sm hover:text-primary text-gray-800 dark:text-slate-200">
                        {n.data.message}
                      </a>
                    </TableCell>
                    <TableCell>{n.read_at ? 'Read' : 'Unread'}</TableCell>
                    <TableCell>{new Date(n.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* simple pagination */}
        <div className="mt-4 flex justify-center space-x-2">
          {notifications.links.map((link, i) => (
            <button
              key={i}
              disabled={!link.url}
              onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
              className={`px-3 py-1 rounded ${
                link.active ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              {link.label.replace(/&laquo;|&raquo;/g, '')}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
