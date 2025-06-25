import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import AppLayout from '@/layouts/app-layout-agent';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from "react";
import { ClipboardList, LayoutGrid, Users, Play, FileText } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    // Mock Data (Replace with actual API data)
    const [stats, setStats] = useState({
        pendingSales: 5,
        completedSales: 12,
        totalClients: 20,
    });

    const announcements = [
        {
            type: "video",
            title: "Exciting New Updates!",
            content: "https://www.w3schools.com/html/mov_bbb.mp4", // Video URL
        },
        {
            type: "image",
            title: "New Sales Goal Reached!",
            content: "https://via.placeholder.com/400", // Image URL
            description: "We've hit our quarterly target! Read more about our achievement.",
        },
        {
            type: "text",
            title: "Policy Changes",
            content: "Important changes to commission structures are coming soon. Click to read more.",
        },
    ];

    const salesProgress = [
        { id: 1, name: "John Doe", progress: 40 },
        { id: 2, name: "Jane Smith", progress: 75 },
        { id: 3, name: "Michael Brown", progress: 20 },
        { id: 4, name: "Sarah Johnson", progress: 90 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                
                {/* 📌 Announcements Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    {announcements.map((announcement, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>{announcement.title}</CardTitle>
                                {announcement.type === "video" && <Play className="h-6 w-6 text-primary" />}
                                {announcement.type === "image" && <FileText className="h-6 w-6 text-primary" />}
                            </CardHeader>
                            <CardContent className="relative">
                                {announcement.type === "video" ? (
                                    <AspectRatio ratio={16 / 9}>
                                        <video className="w-full h-full object-cover rounded-xl" controls>
                                            <source src={announcement.content} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </AspectRatio>
                                ) : announcement.type === "image" ? (
                                    <AspectRatio ratio={16 / 9}>
                                        <img src={announcement.content} alt="Announcement" className="w-full h-full object-cover rounded-xl" />
                                    </AspectRatio>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 📌 Key Stats Section */}
                <div className="grid gap-4 md:grid-cols-3">
                    
                    {/* Pending Sales */}
                    <Card className="relative">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Pending Sales</CardTitle>
                            <ClipboardList className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent className="text-3xl font-bold">
                            {stats.pendingSales}
                        </CardContent>
                    </Card>

                    {/* Completed Sales */}
                    <Card className="relative">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Sales Completed</CardTitle>
                            <LayoutGrid className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent className="text-3xl font-bold">
                            {stats.completedSales}
                        </CardContent>
                    </Card>

                    {/* Total Clients */}
                    <Card className="relative">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Total Clients</CardTitle>
                            <Users className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent className="text-3xl font-bold">
                            {stats.totalClients}
                        </CardContent>
                    </Card>

                </div>

                {/* 📌 Sales Tracker Section */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[250px] flex-1 rounded-xl border p-4">
                    <h2 className="text-lg font-semibold mb-4">Sales Progress Tracker</h2>
                    <div className="space-y-4">
                        {salesProgress.map((sale) => (
                            <div key={sale.id} className="flex flex-col">
                                <span className="text-sm font-medium">{sale.name}</span>
                                <Progress value={sale.progress} className="h-3" />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
