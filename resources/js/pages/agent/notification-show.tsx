import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PageProps {
  notification: {
    id: string;
    read_at: string | null;
    created_at: string;
    data: {
      title?: string;
      body?: string;
      url?: string | null;
    };
  };
}

export default function NotificationShow() {
  const { notification } = usePage<PageProps>().props;

  // mark as read on first render
  if (!notification.read_at) {
    router.put(route('agent.notifications.read', { notification: notification.id }), {}, { preserveScroll: true });
  }

  return (
    <AppLayout>
      <Head title={notification.data.title ?? 'Notification'} />
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{notification.data.title ?? 'Notification'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notification.data.body && (
              <p className="whitespace-pre-line">{notification.data.body}</p>
            )}

            {notification.data.url && (
              <Button asChild>
                <a href={notification.data.url} target="_blank" rel="noopener noreferrer">
                  Open linked page
                </a>
              </Button>
            )}

            <p className="text-sm text-muted-foreground">
              Sent&nbsp;{new Date(notification.created_at).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
