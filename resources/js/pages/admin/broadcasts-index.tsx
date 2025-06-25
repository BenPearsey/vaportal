import { Head, usePage, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface B {
  id: number;
  title: string;
  audience: string;
  created_at: string;
}

export default function Index() {
  const { broadcasts } = usePage<{ broadcasts: { data: B[] } }>().props;

  return (
    <AppLayout breadcrumbs={[{ title: 'Broadcasts', href: route('admin.broadcasts.index') }]}>
      <Head title="Broadcasts" />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Broadcasts</h1>
        <Link href={route('admin.broadcasts.create')}>
          <Button><Plus className="h-4 w-4 mr-1" /> New Broadcast</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {broadcasts.data.map(b => (
          <Card key={b.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{b.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{b.audience.replace('_',' ')}</p>
            </CardHeader>

            <CardContent className="flex-1 flex items-end justify-end">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  router.delete(route('admin.broadcasts.destroy', b.id), {
                    onSuccess: () => toast('Deleted'),
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {broadcasts.data.length === 0 && (
          <p className="text-muted-foreground">No broadcasts yet.</p>
        )}
      </div>
    </AppLayout>
  );
}
