import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BreadcrumbItem } from '@/types';
import { useState, useRef } from 'react';
import axios from 'axios';
import { Descendant } from 'slate';
import SlateEditor, { defaultValue as slateDefaultValue } from '@/components/SlateEditor';
import { toast } from 'sonner'; // adjust to your shadcn toast import


// Extend your form's initial data to include a description.
const initialFormData = {
  title: '',
  type: 'text', // Options: "text", "image", "video"
  content: '',
  description: '',
};

// Use the same default value for Slate editors.
const initialSlateValue: Descendant[] = slateDefaultValue;

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/admin/dashboard' },
  { title: 'Announcements', href: '/admin/manage-announcements' },
  { title: 'Add Announcement', href: '/admin/add-announcement' },
];

export default function AddAnnouncement() {
  const { data, setData, post, processing, errors, reset } = useForm(initialFormData);

  // State for file uploads (for image/video).
  const [file, setFile] = useState<File | null>(null);
  // Slate editor state for "content" (only used when type is text)
  const [editorValue, setEditorValue] = useState<Descendant[]>(initialSlateValue);
  const editorValueRef = useRef<Descendant[]>(initialSlateValue);

  // Slate editor state for "description" (used for image/video announcements)
  const [descriptionValue, setDescriptionValue] = useState<Descendant[]>(initialSlateValue);
  const descriptionValueRef = useRef<Descendant[]>(initialSlateValue);

  // A safe value for the content editor.
  const safeEditorValue =
    editorValue && Array.isArray(editorValue) && editorValue.length > 0
      ? editorValue
      : initialSlateValue;

  // Similarly, a safe value for the description editor.
  const safeDescriptionValue =
    descriptionValue && Array.isArray(descriptionValue) && descriptionValue.length > 0
      ? descriptionValue
      : initialSlateValue;

  const handleFileUpload = async (selectedFile: File) => {
    toast.loading("Uploading file...");

    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await axios.post(route('announcements.upload'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success("Upload successful");

      return response.data.url;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error("File upload failed");
      throw error;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Start with a loading toast.
    const toastId = toast.loading("Posting announcement...");
  
    try {
      if (data.type === "text") {
        // For text announcements, update content immediately from the Slate ref.
        data.content = JSON.stringify(editorValueRef.current);
      } else if (data.type === "image" || data.type === "video") {
        if (file) {
          data.content = await handleFileUpload(file);
        }
        // Also update the description for image/video announcements.
        data.description = JSON.stringify(descriptionValueRef.current);
      }
  
      // Submit the form data using Inertia's post() method.
      post(route("announcements.store"), {
        onSuccess: () => {
          toast.success("Announcement posted successfully!", { id: toastId });
          reset();
          router.get(route("admin.dashboard"));
        },
        onError: () => {
          toast.error("Announcement posting failed!", { id: toastId });
        },
        
      });
      
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Announcement posting failed!", { id: toastId });
    }
  };
  
  

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Announcement" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Enter announcement title"
                />
                {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
              </div>

              {/* Type Selector */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium">
                  Type
                </label>
                <select
                  id="type"
                  value={data.type}
                  onChange={(e) => {
                    setData('type', e.target.value);
                    // Reset content and description fields when type changes.
                    setData('content', '');
                    setData('description', '');
                    setFile(null);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 
                  shadow-sm text-gray-800 dark:text-slate-300"
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
                {data.type === 'text' ? (
                  <SlateEditor
                    value={safeEditorValue}
                    onChange={(newValue) => {
                      const updated = newValue || initialSlateValue;
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
                        accept={data.type === 'image' ? 'image/*' : 'video/*'}
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
                        value={safeDescriptionValue}
                        onChange={(newValue) => {
                          const updated = newValue || initialSlateValue;
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

              <div>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Submitting...' : 'Submit Announcement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
