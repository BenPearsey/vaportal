import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BreadcrumbItem } from '@/types';

interface UpdateRequest {
  id: number;
  client: { client_id: number; firstname: string; lastname: string };
  agent: { firstname: string; lastname: string };
  payload: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function ClientUpdateRequests() {
  // 👇 THIS MUST MATCH what the controller sends:
  const { updateRequests = [] }: { updateRequests: UpdateRequest[] } =
    usePage().props as any;

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    router.post(
      // 👇 use underscores, and match the route parameter name `updateRequest`
      route(
        `admin.client_update_requests.${action}`,
        { updateRequest: id }
      )
      ,
      {},
      {
        onSuccess: () => {
          toast.success(`Request ${action}d.`);
          router.reload({ only: ['updateRequests'] });
        },
        onError: () => {
          toast.error(`Failed to ${action} request.`);
        },
      }
    );
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Home', href: '/admin/dashboard' },
        {
          title: 'Client Update Requests',
          href: '/admin/client-update-requests',
        },
      ]}
    >
      <Head title="Client Update Requests" />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Update Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updateRequests.length ? (
                  updateRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        {req.client.firstname} {req.client.lastname}
                      </TableCell>
                      <TableCell>
                        {req.agent.firstname} {req.agent.lastname}
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside space-y-1">
                          {Object.entries(req.payload).map(
                            ([field, value]) => (
                              <li key={field}>
                                <span className="font-medium">
                                  {field}:
                                </span>{' '}
                                {String(value)}
                              </li>
                            )
                          )}
                        </ul>
                      </TableCell>
                      <TableCell>
                        {new Date(req.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAction(req.id, 'approve')
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleAction(req.id, 'reject')
                          }
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
