import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-agent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { ClipboardList, LayoutGrid, Calendar, UserPlus, Play, FileText } from 'lucide-react';
import { ReadOnlySlate } from '@/components/ReadOnlySlate';
import VideoPlayer from '@/components/VideoPlayer';
import SalesProgressShelf from '@/components/SalesProgressShelf';

export interface Announcement {
  id?: number;
  type: 'text' | 'image' | 'video';
  title: string;
  content: string;
  description?: string;
  created_at?: string;
}

export interface SalesProgressItem {
  id: number;   // sale_id
  name: string; // label from controller (not used by shelf)
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

// Subset of stages to visualize in each widget
const BIG_FIVE_STAGE_KEYS = ['application','payment','certificate','county','carrier'];

export default function Dashboard() {
  const {
    announcements,
    pendingSales,
    salesCompletedThisMonth,
    salesCompletedYear,
    newClientsCurrentYear,
    salesProgress,
  } = usePage<DashboardPageProps>().props;

  const currentYear = new Date().getFullYear();

  return (
    <AppLayout>
      <Head title="Agent Dashboard" />

      <div className="flex flex-col gap-6 p-4">

        {/* 🔹 All of the agent’s sales as live progress cards
            Reads /agent/sales (Inertia JSON) and uses lib/productLabel for titles. */}
        <SalesProgressShelf
          role="agent"
          onlyStageKeys={BIG_FIVE_STAGE_KEYS}
          showCompleteOnce={false}
          hideCompleted={false} // set true if you want to hide 100% complete
          // sourceUrl can be omitted; component defaults to /agent/sales
        />

        {/* Announcements */}
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
                      <ReadOnlySlate key={`${announcement.id}-content`} jsonString={announcement.content} />
                    )}
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

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Pending Sales</CardTitle>
              <ClipboardList className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{pendingSales}</CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Sales Completed This Month</CardTitle>
              <LayoutGrid className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{salesCompletedThisMonth}</CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Sales Completed {currentYear}</CardTitle>
              <Calendar className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{salesCompletedYear}</CardContent>
          </Card>

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
