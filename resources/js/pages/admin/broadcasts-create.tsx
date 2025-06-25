// resources/js/pages/admin/broadcasts-create.tsx
import { Head, useForm }   from '@inertiajs/react';
import AppLayout            from '@/layouts/app-layout-admin';
import { Input }            from '@/components/ui/input';
import { Textarea }         from '@/components/ui/textarea';
import { Button }           from '@/components/ui/button';
import {
  Select, SelectItem, SelectTrigger, SelectContent,
}                           from '@/components/ui/select';
import {
  Card, CardHeader, CardTitle, CardContent,
}                           from '@/components/ui/card';
import { toast }            from 'sonner';          // to show the “Broadcast sent!” toast

export default function Create({ agents, clients }) {
  const { data, setData, post, processing, errors } = useForm({
    title:     '',
    body:      '',
    audience:  'all_agents',
    agent_id:  '',
    client_id: '',
    link:      '',
  });

  const showAgentSel  = data.audience === 'single_agent';
  const showClientSel = data.audience === 'single_client';

  /* ------------------------------------------ */

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Broadcasts', href: route('admin.broadcasts.index') },
        { title: 'New',        href: '#' },
      ]}
    >
      <Head title="New Broadcast" />

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>New Broadcast</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {/* title */}
            <Input
              placeholder="Title"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
            />

            {/* message */}
            <Textarea
              placeholder="Message…"
              rows={5}
              value={data.body}
              onChange={e => setData('body', e.target.value)}
            />

            {/* optional link */}
            <Input
              placeholder="Optional link (https://…)"
              value={data.link}
              onChange={e => setData('link', e.target.value)}
            />

            {/* audience */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience</label>
              <Select
                value={data.audience}
                onValueChange={v => setData('audience', v)}
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="all_agents">All agents</SelectItem>
                  <SelectItem value="all_clients">All clients</SelectItem>
                  <SelectItem value="single_agent">One agent</SelectItem>
                  <SelectItem value="single_client">One client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* single agent */}
            {showAgentSel && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent</label>
                <Select
                  value={data.agent_id}
                  onValueChange={v => setData('agent_id', v)}
                >
                  <SelectTrigger />
                  <SelectContent>
                    {agents.map(a => (
                      <SelectItem key={a.agent_id} value={String(a.agent_id)}>
                        {a.firstname} {a.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* single client */}
            {showClientSel && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select
                  value={data.client_id}
                  onValueChange={v => setData('client_id', v)}
                >
                  <SelectTrigger />
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.client_id} value={String(c.client_id)}>
                        {c.firstname} {c.lastname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* validation errors */}
            {Object.values(errors).map(err => (
              <p key={err} className="text-sm text-red-500">{err}</p>
            ))}

            {/* submit */}
            <Button
              className="w-full"
              disabled={processing}
              onClick={() =>
                post(route('admin.broadcasts.store'), {
                  onSuccess: () => toast('Broadcast sent!'),
                })
              }
            >
              {processing ? 'Sending…' : 'Send Broadcast'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}   // ← **don’t forget this!**  closes the component
