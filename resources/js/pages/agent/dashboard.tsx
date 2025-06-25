import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, LayoutGrid, Calendar, UserPlus, Play, FileText } from 'lucide-react';
import { ReadOnlySlate } from '@/components/ReadOnlySlate';
import VideoPlayer from '@/components/VideoPlayer';

// --- Define TypeScript types for the dashboard data ---
export interface Announcement {
  id?: number;
  type: 'text' | 'image' | 'video';
  title: string;
  content: string;      // For text announcements, this contains Slate JSON.
  description?: string; // For image/video announcements, optional Slate JSON caption.
  created_at?: string;
}

export interface SalesProgressItem {
  id: number;
  name: string;
  progress: number;
}

interface DashboardPageProps {
  announcements: Announcement[];
  pendingSales: number;
  salesCompletedThisMonth: number;
  salesCompletedYear: number;
  newClientsCurrentYear: number;
  salesProgress: SalesProgressItem[];
}

export default function Dashboard() {
  // Retrieve data from the controller's Inertia props and type them as DashboardPageProps.
  const {
    announcements,
    pendingSales,
    salesCompletedThisMonth,
    salesCompletedYear,
    newClientsCurrentYear,
    salesProgress,
  } = usePage<DashboardPageProps>().props;

  // Get the current year (for the stats labels)
  const currentYear = new Date().getFullYear();

  return (
    <AppLayout>
      <Head title="Agent Dashboard" />

      <div className="flex flex-col gap-6 p-4">
        {/* Announcements Section */}
        <div>
          <h2 className="text-xl font-bold">Announcements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="relative overflow-hidden">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>{announcement.title}</CardTitle>
                    {announcement.type === 'video' && <Play className="h-6 w-6 text-primary" />}
                    {announcement.type === 'image' && <FileText className="h-6 w-6 text-primary" />}
                  </CardHeader>
                  <CardContent className="relative space-y-2">
                    {announcement.type === 'video' ? (
                      <div className="rounded-xl overflow-hidden">
                        <VideoPlayer src={announcement.content} />
                      </div>
                    ) : announcement.type === 'image' ? (
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={announcement.content}
                          alt={announcement.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </AspectRatio>
                    ) : (
                      // For text announcements, use ReadOnlySlate to render the Slate JSON.
                      <ReadOnlySlate key={`${announcement.id}-content`} jsonString={announcement.content} />
                    )}

                    {/* Render description if available for non-text announcements */}
                    {announcement.description && announcement.type !== 'text' && (
                      <div className="mt-2">
                        <ReadOnlySlate key={`${announcement.id}-description`} jsonString={announcement.description} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No announcements available.</p>
            )}
          </div>
        </div>

        {/* Key Stats Section */}
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

          {/* Sales Completed for the Current Year */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Sales Completed {currentYear}</CardTitle>
              <Calendar className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{salesCompletedYear}</CardContent>
          </Card>

          {/* New Clients for the Current Year */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>New Clients for {currentYear}</CardTitle>
              <UserPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{newClientsCurrentYear}</CardContent>
          </Card>
        </div>

        {/* Sales Progress Tracker Section */}
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[250px] flex-1 rounded-xl border p-4">
          <h2 className="text-lg font-semibold mb-4">Sales Progress Tracker</h2>
          <div className="space-y-4">
            {salesProgress && salesProgress.length > 0 ? (
              salesProgress.map((sale) => (
                <div key={sale.id} className="flex flex-col">
                  <span className="text-sm font-medium">{sale.name}</span>
                  <Progress value={sale.progress} className="h-3" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No sales progress data available.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
