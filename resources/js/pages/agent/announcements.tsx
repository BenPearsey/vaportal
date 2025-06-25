import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-agent";
import { Play, FileText, Filter } from "lucide-react";

const announcementsData = [
    {
        id: 1,
        type: "video",
        title: "Exciting New Updates!",
        content: "https://www.w3schools.com/html/mov_bbb.mp4", // Video URL
        date: "Feb 22, 2025",
    },
    {
        id: 2,
        type: "image",
        title: "New Sales Goal Reached!",
        content: "https://via.placeholder.com/400", // Image URL
        description: "We've hit our quarterly target! Read more about our achievement.",
        date: "Feb 20, 2025",
    },
    {
        id: 3,
        type: "text",
        title: "Policy Changes",
        content: "Important changes to commission structures are coming soon. Click to read more.",
        date: "Feb 18, 2025",
    },
];

export default function AnnouncementsPage() {
    const [filter, setFilter] = useState("all");

    const filteredAnnouncements =
        filter === "all" ? announcementsData : announcementsData.filter((item) => item.type === filter);

    return (
        <AppLayout>
            <Head title="Announcements" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">All Announcements</h1>

                {/* Filter Buttons */}
                <div className="flex gap-2 mb-4">
                    <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                        <Filter className="mr-2 h-4 w-4" /> All
                    </Button>
                    <Button variant={filter === "text" ? "default" : "outline"} onClick={() => setFilter("text")}>
                        <FileText className="mr-2 h-4 w-4" /> Text
                    </Button>
                    <Button variant={filter === "image" ? "default" : "outline"} onClick={() => setFilter("image")}>
                        <FileText className="mr-2 h-4 w-4" /> Image
                    </Button>
                    <Button variant={filter === "video" ? "default" : "outline"} onClick={() => setFilter("video")}>
                        <Play className="mr-2 h-4 w-4" /> Video
                    </Button>
                </div>

                {/* Announcements Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Announcements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAnnouncements.map((announcement) => (
                                    <TableRow key={announcement.id}>
                                        <TableCell>{announcement.title}</TableCell>
                                        <TableCell className="capitalize">{announcement.type}</TableCell>
                                        <TableCell>{announcement.date}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" onClick={() => alert("View details feature coming soon!")}>
                                                View
                                            </Button>
                                        </TableCell>
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
