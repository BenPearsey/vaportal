import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

interface Props {
  notifications: {
    data: any[];
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/agent/dashboard' },
  { title: 'Notifications', href: '/agent/notifications' },
];

export default function AgentNotifications({ notifications }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
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
                {notifications.data.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <a
                        className="text-blue-600 hover:underline"
                        onClick={() =>
                          router.visit(
                            n.data.url ??
                              route('agent.notifications.show', { notification: n.id })
                          )
                        }
                      >
                        {n.data.title ?? n.data.message ?? 'Notification'}
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
      </div>
    </AppLayout>
  );
}
