import { useState, useRef, useEffect } from "react";
import { Head, usePage, router, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SlateEditor, { defaultValue as slateDefaultValue } from "@/components/SlateEditor";
import { toast } from "sonner";
import { Descendant } from "slate";
import axios from "axios";
import { BreadcrumbItem } from "@/types";

// ---------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------
interface Announcement {
  id: number;
  title: string;
  type: "text" | "image" | "video";
  content: string;
  description?: string;
  created_at: string;
}

interface ManageAnnouncementsProps {
  announcements: Announcement[];
}

// ---------------------------------------------------------------------
// Edit Announcement Modal Component
// ---------------------------------------------------------------------
type EditAnnouncementModalProps = {
  announcement: Announcement;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

function EditAnnouncementModal({ announcement, isOpen, onClose, onUpdated }: EditAnnouncementModalProps) {
  // Prepare initial form data from the announcement.
  const initialData = {
    title: announcement.title,
    type: announcement.type,
    content: announcement.content,
    description: announcement.description || "",
  };

  const { data, setData, put, processing, errors, reset } = useForm(initialData);

  // State for file upload if needed.
  const [file, setFile] = useState<File | null>(null);

  // Slate editor state for "content" (if type is text).
  const [editorValue, setEditorValue] = useState<Descendant[]>(() => {
    if (announcement.type === "text") {
      try {
        return JSON.parse(announcement.content) as Descendant[];
      } catch {
        return slateDefaultValue;
      }
    }
    return slateDefaultValue;
  });
  const editorValueRef = useRef<Descendant[]>(editorValue);

  // Slate editor state for "description" (if type is image/video).
  const [descriptionValue, setDescriptionValue] = useState<Descendant[]>(() => {
    if (announcement.type !== "text" && announcement.description) {
      try {
        return JSON.parse(announcement.description) as Descendant[];
      } catch {
        return slateDefaultValue;
      }
    }
    return slateDefaultValue;
  });
  const descriptionValueRef = useRef<Descendant[]>(descriptionValue);

  // Update the form values when the announcement changes.
  useEffect(() => {
    setData("title", announcement.title);
    setData("type", announcement.type);
    setData("content", announcement.content);
    setData("description", announcement.description || "");
    if (announcement.type === "text") {
      try {
        const initial = JSON.parse(announcement.content) as Descendant[];
        setEditorValue(initial);
        editorValueRef.current = initial;
      } catch {
        setEditorValue(slateDefaultValue);
        editorValueRef.current = slateDefaultValue;
      }
    } else if (announcement.description) {
      try {
        const initDesc = JSON.parse(announcement.description) as Descendant[];
        setDescriptionValue(initDesc);
        descriptionValueRef.current = initDesc;
      } catch {
        setDescriptionValue(slateDefaultValue);
        descriptionValueRef.current = slateDefaultValue;
      }
    }
    setFile(null);
  }, [announcement, setData]);

  const handleFileUpload = async (selectedFile: File) => {
    toast.loading("Uploading file...");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await axios.post(route("announcements.upload"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Upload successful");
      return response.data.url;
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("File upload failed");
      throw error;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Updating announcement...");
    try {
      if (data.type === "text") {
        data.content = JSON.stringify(editorValueRef.current);
      } else if (data.type === "image" || data.type === "video") {
        if (file) {
          data.content = await handleFileUpload(file);
        }
        data.description = JSON.stringify(descriptionValueRef.current);
      }
      put(route("announcements.update", announcement.id), {
        onSuccess: () => {
          toast.success("Announcement updated successfully!", { id: toastId });
          onUpdated();
          onClose();
          reset();
        },
        onError: () => {
          toast.error("Announcement update failed!", { id: toastId });
        },
      });
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Announcement update failed!", { id: toastId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Announcement</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium">Title</label>
            <Input
              id="edit-title"
              type="text"
              value={data.title}
              onChange={(e) => setData("title", e.target.value)}
              placeholder="Enter announcement title"
            />
            {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
          </div>
          {/* Type Selector */}
          <div>
            <label htmlFor="edit-type" className="block text-sm font-medium">Type</label>
            <select
              id="edit-type"
              value={data.type}
              onChange={(e) => {
                setData("type", e.target.value);
                setData("content", "");
                setData("description", "");
                setFile(null);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            {errors.type && <span className="text-red-500 text-sm">{errors.type}</span>}
          </div>
          {/* Content Editor / File Upload */}
          <div>
            <label className="block text-sm font-medium">Content</label>
            {data.type === "text" ? (
              <SlateEditor
                value={editorValue}
                onChange={(newValue) => {
                  const updated = newValue || slateDefaultValue;
                  setEditorValue(updated);
                  editorValueRef.current = updated;
                }}
                placeholder="Write your announcement..."
              />
            ) : (
              <>
                <div>
                  <Input
                    type="file"
                    accept={data.type === "image" ? "image/*" : "video/*"}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                  {file && <p className="text-sm">Selected file: {file.name}</p>}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium">Caption / Description</label>
                  <SlateEditor
                    value={descriptionValue}
                    onChange={(newValue) => {
                      const updated = newValue || slateDefaultValue;
                      setDescriptionValue(updated);
                      descriptionValueRef.current = updated;
                    }}
                    placeholder="Enter caption or description for the media..."
                  />
                </div>
              </>
            )}
            {errors.content && <span className="text-red-500 text-sm">{errors.content}</span>}
            {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={processing}>
              {processing ? "Updating..." : "Update Announcement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------
// ManageAnnouncements Page Component
// ---------------------------------------------------------------------
export default function ManageAnnouncements() {
  const { announcements = [] } = usePage().props as { announcements: Announcement[] };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);

  const openEditModal = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setCurrentAnnouncement(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      router.delete(route("announcements.destroy", id), {
        onSuccess: () => {
          console.log("Deleted successfully");
        },
      });
    }
  };

  const handleUpdated = () => {
    // Optionally refresh data here
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Manage Announcements", href: "/admin/announcement" }]}>
      <Head title="Manage Announcements" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Announcements</h1>
          </div>
          <div>
            <Link href={route("announcements.create")}>
              <Button variant="default">Add New Announcement</Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>{announcement.title}</TableCell>
                    <TableCell>{announcement.type}</TableCell>
                    <TableCell>
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" onClick={() => openEditModal(announcement)}>
                        <Pencil className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="h-5 w-5 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {currentAnnouncement && (
        <EditAnnouncementModal
          announcement={currentAnnouncement}
          isOpen={editModalOpen}
          onClose={closeEditModal}
          onUpdated={handleUpdated}
        />
      )}
    </AppLayout>
  );
}
