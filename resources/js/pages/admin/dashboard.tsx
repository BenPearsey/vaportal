import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { BreadcrumbItem } from '@/types';
import { 
  ClipboardList, 
  LayoutGrid, 
  Calendar, 
  UserPlus, 
  Play, 
  FileText 
} from "lucide-react";
import { ReadOnlySlate } from '@/components/ReadOnlySlate';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/VideoPlayer';


//
// Define types for your data. You can import these types if they’re defined elsewhere.
//
export interface Announcement {
  id?: number;
  type: 'text' | 'image' | 'video';
  title: string;
  content: string;      // For text announcements this contains Slate JSON.
  description?: string; // For image/video announcements, optional Slate JSON caption.
  created_at?: string;
}

export interface Sale {
  sale_id: number;
  agent_id: number;
  client_id: number;
  sale_date: string;
  status: string;
}

export interface Client {
  client_id: number;
  firstname: string;
  lastname: string;
  created_at: string;
}

export interface DashboardProps {
  announcements?: Announcement[];
  sales?: Sale[];
  clients?: Client[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/admin/dashboard' },
];

export default function AdminDashboard() {
  // Grab page props and supply fallback defaults.
  const pageProps = usePage().props as unknown as DashboardProps;
  const announcements: Announcement[] = pageProps.announcements ?? [];
  const sales: Sale[] = pageProps.sales ?? [];
  const clients: Client[] = pageProps.clients ?? [];

  console.log("Dashboard props:", { announcements, sales, clients });

  // Compute stats dynamically using the current year.
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // zero-indexed

  // Pending Sales: all sales not having status Completed, Matured, or Cancelled.
  const pendingSales = sales.filter(
    sale => !["Completed", "Matured", "Cancelled"].includes(sale.status)
  ).length;

  // Sales Completed This Month: Completed sales with a sale_date in the current month.
  const salesCompletedThisMonth = sales.filter(sale => {
    if (sale.status !== "Completed") return false;
    const saleDate = new Date(sale.sale_date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  }).length;

  // Sales Completed for the current year.
  const salesCompletedYear = sales.filter(sale => {
    if (sale.status !== "Completed") return false;
    return new Date(sale.sale_date).getFullYear() === currentYear;
  }).length;

  // New Clients for the current year: clients with created_at in currentYear and at least one completed sale.
  const newClientsCurrentYear = clients.filter(client => {
    if (new Date(client.created_at).getFullYear() !== currentYear) return false;
    return sales.some(sale => sale.status === "Completed" && sale.client_id === client.client_id);
  }).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Home" />

      <div className="flex flex-col gap-6 p-4">
        
        {/* Announcements Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Announcements</h2>
          <div className="flex gap-2">
            <Link href={route('announcements.create')} className="btn btn-outline">
            <Button variant="outline">
              Add New Announcement
              </Button>
            </Link>
            <Link href={route('admin.announcement.manage')} className="btn btn-outline">
            <Button variant="outline">
              Manage Announcements
              </Button>
            </Link>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="relative overflow-hidden">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>{announcement.title}</CardTitle>
                  {announcement.type === "video" && <Play className="h-6 w-6 text-primary" />}
                  {announcement.type === "image" && <FileText className="h-6 w-6 text-primary" />}
                </CardHeader>
                <CardContent className="relative space-y-2">
                {announcement.type === "video" ? (
  <div className="rounded-xl overflow-hidden">
    <VideoPlayer src={announcement.content} />
  </div>
                  ) : announcement.type === "image" ? (
                    <AspectRatio ratio={16 / 9}>
                      <img src={announcement.content} alt={announcement.title} className="w-full h-full object-cover rounded-xl" />
                    </AspectRatio>
                  ) : (
                    // For "text" announcements, assume content is Slate JSON.
                    <ReadOnlySlate key={announcement.id + announcement.content} jsonString={announcement.content} />
                  )}

                  {/* For image/video announcements, render description if available */}
                  {announcement.description && announcement.type !== 'text' && (
                    <div className="mt-2">
                      <ReadOnlySlate key={announcement.id + announcement.description} jsonString={announcement.description} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No announcements available.</p>
          )}
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pending Sales */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Pending Sales</CardTitle>
              <ClipboardList className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{pendingSales}</CardContent>
          </Card>

          {/* Sales Completed This Month */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Sales Completed This Month</CardTitle>
              <LayoutGrid className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{salesCompletedThisMonth}</CardContent>
          </Card>

          {/* Sales Completed for {currentYear} */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Sales Completed {currentYear}</CardTitle>
              <Calendar className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{salesCompletedYear}</CardContent>
          </Card>

          {/* New Clients for {currentYear} */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>New Clients for {currentYear}</CardTitle>
              <UserPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{newClientsCurrentYear}</CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
