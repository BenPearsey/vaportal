import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { EyeIcon } from "lucide-react";
import type { BreadcrumbItem } from "@/types";
import { ReadOnlySlate } from '@/components/ReadOnlySlate';
import VideoPlayer      from '@/components/VideoPlayer';
import { AspectRatio }  from '@/components/ui/aspect-ratio';
import { Play, FileText } from 'lucide-react';

interface DashboardProps {
  announcements: {
    id: number;
    type: "text" | "image" | "video";
    title: string;
    content: string;
  }[];
  products: any[];
  alerts: { sale_id: number; product: string; anniversary: string }[];
  agent: {
    agent_id: number;
    firstname: string;
    lastname: string;
    phone?: string;
    email?: string;
  } | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Dashboard", href: "/dashboard" }];

export default function Dashboard() {
  const { announcements = [], products = [], alerts = [], agent = null } = usePage<DashboardProps>().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 p-4">
  
<div>
  <h2 className="text-xl font-bold mb-2">Announcements</h2>
  <div className="grid gap-4 md:grid-cols-3">
    {announcements.length ? (
      announcements.map(a => (
        <Card key={a.id} className="relative overflow-hidden">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{a.title}</CardTitle>
            {a.type === 'video' && <Play className="h-6 w-6 text-primary" />}
            {a.type === 'image' && <FileText className="h-6 w-6 text-primary" />}
          </CardHeader>

          <CardContent className="relative space-y-2">
            {a.type === 'video' ? (
              <div className="rounded-xl overflow-hidden">
                <VideoPlayer src={a.content} />
              </div>
            ) : a.type === 'image' ? (
              <AspectRatio ratio={16 / 9}>
                <img
                  src={a.content}
                  alt={a.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </AspectRatio>
            ) : (
              <ReadOnlySlate jsonString={a.content} />
            )}
          </CardContent>
        </Card>
      ))
    ) : (
      <p className="text-sm text-muted-foreground">No announcements.</p>
    )}
  </div>
</div>

        {/* Index-Reallocation Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Index Reallocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {alerts.map((al) => (
                  <li key={al.sale_id}>
                    {al.product} – anniversary on <strong>{al.anniversary}</strong>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Products table */}
        <Card>
          <CardHeader>
            <CardTitle>My Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.sale_id}>
                      <TableCell>{p.product}</TableCell>
                      <TableCell>{p.issue_date}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={route("client.sales.show", { sale: p.sale_id })}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" /> View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Agent Contact card */}
        {agent && (
          <Card>
            <CardHeader>
              <CardTitle>My Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p>
                {agent.firstname} {agent.lastname}
              </p>
              {agent.phone && <p>Phone: {agent.phone}</p>}
              {agent.email && (
                <p>
                  Email:{" "}
                  <a href={`mailto:${agent.email}`} className="text-blue-600 hover:underline">
                    {agent.email}
                  </a>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
