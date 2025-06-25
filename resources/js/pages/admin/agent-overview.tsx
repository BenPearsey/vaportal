// AgentOverview.tsx
import { Head, usePage, useForm, router, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  EyeIcon,
  TrashIcon,
  Upload as UploadIcon,
  FileText as FileIcon,
  Folder as FolderIcon,
} from "lucide-react";

// Agent types and document/note types
import { Agent } from "@/types/agent";
import { AgentDocument } from "@/types/document";
import { AgentNote } from "@/types/note";
import AgentChecklist from "@/components/AgentChecklist";


// -----------------------------
// Interfaces
// -----------------------------
interface Folder {
  id: number;
  name: string;
  parent_id?: number | null;
}

// -----------------------------
// AgentFileExplorer Component
// -----------------------------
// This component mirrors the client file explorer but works for agents.
interface AgentFileExplorerProps {
  agentId: number;
  folders: Folder[];
  documents: AgentDocument[];
  onFileUpload: (file: File, folderId: number, title: string) => void;
  onDeleteDocument: (docId: number) => void;
  onMoveDocument: (docId: number, newFolderId: number) => void;
  onCreateFolder: (folderName: string, parentId?: number | null) => void;
  onRenameDocument: (docId: number, newTitle: string) => void;
  onRequestDeleteDocument: (docId: number) => void;
  onRequestDeleteFolder: (folderId: number) => void;
}

function AgentFileExplorer({
  agentId,
  folders,
  documents,
  onFileUpload,
  onDeleteDocument,
  onMoveDocument,
  onCreateFolder,
  onRenameDocument,
  onRequestDeleteDocument,
  onRequestDeleteFolder,
}: AgentFileExplorerProps) {
  // Virtual root folder for navigation.
  const virtualRoot: Folder = { id: 0, name: "General", parent_id: null };
  const [folderPath, setFolderPath] = useState<Folder[]>([virtualRoot]);
  const currentFolder = folderPath[folderPath.length - 1];

  // State for upload dialog.
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  // State for new folder dialog.
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // States for context menus and renaming/moving.
  const [contextMenu, setContextMenu] = useState<{ docId: number; x: number; y: number } | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameDocId, setRenameDocId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDocId, setMoveDocId] = useState<number | null>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<{ folderId: number; x: number; y: number } | null>(null);
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<number | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Determine which folders to display based on currentFolder.
  const displayedFolders = folders.filter((folder) =>
    currentFolder.id === 0 ? folder.parent_id === null : folder.parent_id === currentFolder.id
  );

  // Filter documents by current folder.
  const filteredDocs =
    currentFolder.id === 0
      ? documents.filter((doc) => doc.folder_id === null)
      : documents.filter((doc) => doc.folder_id === currentFolder.id);

  // Combine folders and documents.
  const combinedItems = [
    ...displayedFolders.map((folder) => ({ type: "folder", ...folder })),
    ...filteredDocs.map((doc) => ({ type: "document", ...doc })),
  ];

  // Sort items: folders first, then documents.
  combinedItems.sort((a, b) => {
    if (a.type === b.type) {
      const nameA = a.type === "folder" ? a.name : a.title || a.path;
      const nameB = b.type === "folder" ? b.name : b.title || b.path;
      return String(nameA).localeCompare(String(nameB));
    } else if (a.type === "folder") {
      return -1;
    } else {
      return 1;
    }
  });

  const handleUploadSubmit = () => {
    if (uploadFile) {
      onFileUpload(uploadFile, currentFolder.id, uploadTitle);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDialogOpen(false);
    }
  };

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setFolderContextMenu(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      {/* Navigation Header */}
      <div className="p-4 border-b">
        <h3 className="mb-2 font-semibold">
          {currentFolder.id === 0 ? "My Documents" : currentFolder.name}
        </h3>
        {folderPath.length > 1 && (
          <div className="mb-2">
            <Button variant="outline" onClick={() => setFolderPath(folderPath.slice(0, folderPath.length - 1))}>
              Back
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={() => setNewFolderDialogOpen(true)}>Create New Folder</Button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            Items in {currentFolder.id === 0 ? "My Documents" : currentFolder.name}
          </h3>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <UploadIcon className="h-5 w-5 mr-2" /> Upload Document
          </Button>
        </div>
        {combinedItems.length > 0 ? (
          <div className="grid grid-cols-6 gap-4">
            {combinedItems.map((item: any) => {
              if (item.type === "folder") {
                return (
                  <div
                    key={`folder-${item.id}`}
                    onClick={() => setFolderPath([...folderPath, item])}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const docIdStr = e.dataTransfer.getData("text/plain");
                      if (docIdStr) {
                        const docId = parseInt(docIdStr);
                        onMoveDocument(docId, item.id);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setFolderContextMenu({
                          folderId: item.id,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      } else {
                        setFolderContextMenu({ folderId: item.id, x: e.clientX, y: e.clientY });
                      }
                    }}
                    className="flex flex-col items-center p-4 border rounded cursor-pointer hover:bg-gray-100"
                  >
                    <FolderIcon className="h-8 w-8 mb-2" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                );
              } else {
                const displayTitle =
                  item.title && item.title.trim() !== ""
                    ? item.title
                    : item.path
                    ? item.path.split("/").pop()
                    : "Untitled";
                return (
                  <div
                    key={`doc-${item.id}`}
                    className="flex flex-col items-center"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item.id.toString());
                    }}
                    onDoubleClick={() => {
                      window.open(
                        route("admin.agents.documents.view", { agent: agentId, document: item.id }),
                        "_blank"
                      );
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setContextMenu({
                          docId: item.id,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      } else {
                        setContextMenu({ docId: item.id, x: e.clientX, y: e.clientY });
                      }
                    }}
                  >
                    <FileIcon className="h-10 w-10" />
                    <div className="text-xs mt-1 text-center">{displayTitle}</div>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          <p>No items in this folder.</p>
        )}

        {/* Drag & Drop Upload Zone */}
        <div
          className="border border-dashed rounded p-4 mt-6 text-center"
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              setUploadFile(file);
              setUploadTitle(file.name);
              setUploadDialogOpen(true);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          Drag & Drop file here to upload to this folder
        </div>
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="upload-doc-description">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription id="upload-doc-description">
              Select a file and enter a title.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadFile(file);
                  setUploadTitle(file.name);
                }
              }}
            />
            <Input
              placeholder="Document Title"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <Button onClick={handleUploadSubmit}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="new-folder-description">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription id="new-folder-description">
              Enter a name for the new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <Button
              onClick={() => {
                onCreateFolder(newFolderName, currentFolder.id === 0 ? null : currentFolder.id);
                setNewFolderName("");
                setNewFolderDialogOpen(false);
              }}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Deletion Confirmation Dialog */}
      {/* Add state for folder deletion */}
      <FolderDeletionDialog />

      {/* Folder Context Menu */}
      {folderContextMenu && (
        <div
          className="absolute bg-white border rounded shadow p-2 z-50"
          style={{ top: folderContextMenu.y, left: folderContextMenu.x }}
        >
          <div
            className="cursor-pointer p-1 hover:bg-gray-100 text-sm"
            onClick={() => {
              setRenameFolderId(folderContextMenu.folderId);
              const f = folders.find((fl) => fl.id === folderContextMenu.folderId);
              setRenameFolderName(f ? f.name : "");
              setRenameFolderDialogOpen(true);
              setFolderContextMenu(null);
            }}
          >
            Rename Folder
          </div>
          <div
            className="cursor-pointer p-1 hover:bg-gray-100 text-sm"
            onClick={() => {
              onRequestDeleteFolder(folderContextMenu.folderId);
              setFolderContextMenu(null);
            }}
          >
            Delete Folder
          </div>
        </div>
      )}

      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderDialogOpen} onOpenChange={setRenameFolderDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="rename-folder-description">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription id="rename-folder-description">
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New Folder Name"
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
            />
            <Button
              onClick={() => {
                if (renameFolderId !== null) {
                  router.post(
                    route("admin.agents.documents.folder.rename", { folder: renameFolderId }),
                    { name: renameFolderName },
                    {
                      onSuccess: () => {
                        toast("Folder renamed successfully!");
                        router.reload({ only: ["documents"] });
                      },
                      onError: (error) => {
                        console.error("Folder rename failed", error);
                      },
                    }
                  );
                  setRenameFolderDialogOpen(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Context Menu */}
      {contextMenu && (
        <div
          className="absolute bg-white border rounded shadow p-2 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div
            className="cursor-pointer p-1 hover:bg-gray-100 text-sm"
            onClick={() => {
              setRenameDocId(contextMenu.docId);
              const doc = documents.find((d) => d.id === contextMenu.docId);
              const currentTitle =
                doc?.title && doc.title.trim() !== ""
                  ? doc.title
                  : doc?.path
                  ? doc.path.split("/").pop()
                  : "";
              setRenameTitle(currentTitle);
              setRenameDialogOpen(true);
              setContextMenu(null);
            }}
          >
            Rename
          </div>
          <div
            className="cursor-pointer p-1 hover:bg-gray-100 text-sm"
            onClick={() => {
              setMoveDocId(contextMenu.docId);
              setMoveDialogOpen(true);
              setContextMenu(null);
            }}
          >
            Move
          </div>
          <div
            className="cursor-pointer p-1 hover:bg-gray-100 text-sm"
            onClick={() => {
              onRequestDeleteDocument(contextMenu.docId);
              setContextMenu(null);
            }}
          >
            Delete
          </div>
        </div>
      )}

      {/* Rename Document Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="rename-doc-description">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription id="rename-doc-description">
              Enter a new title for this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New Title"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
            />
            <Button
              onClick={() => {
                if (renameDocId !== null) {
                  onRenameDocument(renameDocId, renameTitle);
                  setRenameDialogOpen(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Document Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="move-doc-description">
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
            <DialogDescription id="move-doc-description">
              Select a destination folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => {
                if (moveDocId !== null) {
                  onMoveDocument(moveDocId, 0);
                  setMoveDialogOpen(false);
                }
              }}
              variant="outline"
              className="w-full text-left"
            >
              General
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder.id}
                onClick={() => {
                  if (moveDocId !== null) {
                    onMoveDocument(moveDocId, folder.id);
                    setMoveDialogOpen(false);
                  }
                }}
                variant="outline"
                className="w-full text-left"
              >
                {folder.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -----------------------------
// FolderDeletionDialog Component
// -----------------------------
function FolderDeletionDialog() {
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [folderIdToDelete, setFolderIdToDelete] = useState<number | null>(null);

  // Expose a function to trigger the deletion dialog.
  // In your AgentOverview, pass handleRequestDeleteFolder as:
  //   (folderId) => { setFolderIdToDelete(folderId); setDeleteFolderDialogOpen(true); }
  // Here we assume that function is defined in the parent component.
  // For simplicity, we define it here and then export it.
  // (Alternatively, you can inline this dialog in AgentOverview.)

  return (
    <Dialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
      <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="delete-folder-description">
        <DialogHeader>
          <DialogTitle>Confirm Folder Deletion</DialogTitle>
          <DialogDescription id="delete-folder-description">
            Are you sure you want to delete this folder?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (folderIdToDelete !== null) {
                  router.delete(
                    route("admin.agents.documents.folder.destroy", { folder: folderIdToDelete }),
                    {
                      onSuccess: () => {
                        toast("Folder deleted successfully!");
                        router.reload({ only: ["documents"] });
                        setDeleteFolderDialogOpen(false);
                      },
                      onError: (error) => {
                        console.error("Folder deletion failed", error);
                      },
                    }
                  );
                }
              }}
            >
              Delete
            </Button>
            <Button onClick={() => setDeleteFolderDialogOpen(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------
// EditAgentForm Component (Placeholder)
// -----------------------------
interface EditAgentFormProps {
  agent: {
    agent_id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    zipcode?: string | null;
    company?: string | null;
  };
}

function EditAgentForm({ agent }: EditAgentFormProps) {  /** populate the form with the agent’s current data */
  const { data, setData, put, processing, errors } = useForm({
    firstname: agent.firstname ?? "",
    lastname: agent.lastname ?? "",
    email: agent.email ?? "",
    phone: agent.phone ?? "",
    address: agent.address ?? "",
    city: agent.city ?? "",
    zipcode: agent.zipcode ?? "",
    company: agent.company ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route("admin.agents.update", { agent: agent.agent_id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast("Agent updated!");
        router.reload({ only: ["agent"] }); // refresh the overview tab
      },
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* First Name */}
      <div>
        <label className="block mb-1">First Name</label>
        <Input
          value={data.firstname}
          onChange={(e) => setData("firstname", e.target.value)}
        />
        {errors.firstname && (
          <p className="text-sm text-red-600">{errors.firstname}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label className="block mb-1">Last Name</label>
        <Input
          value={data.lastname}
          onChange={(e) => setData("lastname", e.target.value)}
        />
        {errors.lastname && (
          <p className="text-sm text-red-600">{errors.lastname}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1">Email</label>
        <Input
          type="email"
          value={data.email}
          onChange={(e) => setData("email", e.target.value)}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block mb-1">Phone</label>
        <Input
          value={data.phone ?? ""}
          onChange={(e) => setData("phone", e.target.value)}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block mb-1">Address</label>
        <Input
          value={data.address ?? ""}
          onChange={(e) => setData("address", e.target.value)}
        />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block mb-1">City</label>
        <Input
          value={data.city ?? ""}
          onChange={(e) => setData("city", e.target.value)}
        />
        {errors.city && (
          <p className="text-sm text-red-600">{errors.city}</p>
        )}
      </div>

      {/* Zipcode */}
      <div>
        <label className="block mb-1">Zip Code</label>
        <Input
          value={data.zipcode ?? ""}
          onChange={(e) => setData("zipcode", e.target.value)}
        />
        {errors.zipcode && (
          <p className="text-sm text-red-600">{errors.zipcode}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <label className="block mb-1">Company</label>
        <Input
          value={data.company ?? ""}
          onChange={(e) => setData("company", e.target.value)}
        />
        {errors.company && (
          <p className="text-sm text-red-600">{errors.company}</p>
        )}
      </div>

      {/* Save button */}
      <div className="pt-2">
        <Button type="submit" disabled={processing}>
          {processing ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// -----------------------------
// Main AgentOverview Component
// -----------------------------
export default function AgentOverview() {
  const { agent, documents = [], notes = [], folders = [], sales = [], clients = [] } = usePage().props as {
    agent?: Agent;
    documents?: AgentDocument[];
    notes?: AgentNote[];
    folders?: Folder[];
    sales?: any[];
    clients?: any[];
  };

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<number | null>(null);

  const { data: noteData, setData: setNoteData, post: postNote, processing: noteProcessing, reset: resetNote } = useForm({
    content: "",
    agent_id: agent?.agent_id || 0,
  });

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent?.agent_id) return;
    router.post(route("admin.agents.notes.store", { agent: agent.agent_id }), noteData, {
      onSuccess: () => {
        toast("Note added successfully!");
        resetNote("content");
        setNoteDialogOpen(false);
        router.reload({ only: ["notes"] });
      },
    });
  };

  const deleteNote = (noteId: number) => {
    if (!agent?.agent_id) return;
    router.delete(
      route("admin.agents.notes.destroy", { agent: agent.agent_id, note: noteId }),
      {
        onSuccess: () => {
          toast("Note deleted!");
          router.reload({ only: ["notes"] });
        },
      }
    );
  };

  const deleteDocument = (docId: number) => {
    if (!agent?.agent_id) return;
    router.delete(
      route("admin.agents.documents.destroy", { agent: agent.agent_id, document: docId }),
      {
        onSuccess: () => {
          toast("Document deleted!");
          router.reload({ only: ["documents"] });
        },
      }
    );
  };

  const renameDocument = (docId: number, newTitle: string) => {
    router.post(
      route("admin.agents.documents.rename", { agent: agent.agent_id, document: docId }),
      { title: newTitle },
      {
        onSuccess: () => {
          toast("Document renamed successfully!");
          router.reload({ only: ["documents"] });
        },
        onError: (error) => {
          console.error("Rename failed", error);
        },
      }
    );
  };

  // Handlers for deletion confirmation from the file explorer.
  const handleRequestDeleteDocument = (docId: number) => {
    // For now, simply call deleteDocument (or you could show a confirmation dialog)
    deleteDocument(docId);
  };

  const handleRequestDeleteFolder = (folderId: number) => {
    // Open the folder deletion dialog by setting the folder ID in the FolderDeletionDialog component.
    // Here we simply use a state in this component.
    setFolderIdToDelete(folderId);
    setDeleteFolderDialogOpen(true);
  };

  // State for folder deletion confirmation.
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [folderIdToDelete, setFolderIdToDelete] = useState<number | null>(null);

  if (!agent) {
    return (
      <AppLayout>
        <Head title="Agent Not Found" />
        <div className="p-6 text-center text-red-500">
          <p>Agent data is missing. Please check the backend response.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Agent Overview - ${agent.firstname} ${agent.lastname}`} />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {agent.firstname} {agent.lastname}
          </h1>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Edit Agent</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Agent</DialogTitle>
                </DialogHeader>
                <EditAgentForm agent={agent} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Agent Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Email:</strong> {agent.email}</p>
                <p><strong>Phone:</strong> {agent.phone || "N/A"}</p>
                <p><strong>Address:</strong> {agent.address || "N/A"}</p>
                <p><strong>City:</strong> {agent.city || "N/A"}</p>
                <p><strong>Zip Code:</strong> {agent.zipcode || "N/A"}</p>
                <p><strong>Company:</strong> {agent.company || "N/A"}</p>
                {/* ───── Clients & Sales cards ───── */}
{clients.length > 0 && (
  <>
    <h3 className="mt-6 text-lg font-semibold">Clients</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      {clients.map((c: any) => (
        <Card key={c.id ?? c.client_id} className="hover:shadow-lg">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="font-medium">
              {c.firstname} {c.lastname}
            </div>
            <Link
              href={route("admin.clients.overview", { client: c.id ?? c.client_id })}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <EyeIcon className="h-4 w-4" /> View client
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </>
)}

{sales.length > 0 && (
  <>
    <h3 className="mt-6 text-lg font-semibold">Sales</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      {sales.map((s: any) => (
        <Card key={s.id ?? s.sale_id} className="hover:shadow-lg">
          <CardContent className="p-4 flex flex-col gap-2">
            <div className="font-medium">{s.product ?? "Sale"}</div>
            <div className="text-sm">${s.total_sale_amount ?? s.amount}</div>
            <Link
              href={route("admin.sales.show", { sale: s.id ?? s.sale_id })}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <EyeIcon className="h-4 w-4" /> View sale
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </>
)}
<Card className="mt-6">
  <CardHeader><CardTitle>Checklist</CardTitle></CardHeader>
  <CardContent>
    <AgentChecklist agentId={agent.agent_id} checklist={agent.checklist ?? []} />
  </CardContent>
</Card>


              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentFileExplorer
                  agentId={agent.agent_id}
                  folders={folders}
                  documents={documents}
                  onFileUpload={(file, folderId, title) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("folder_id", folderId.toString());
                    formData.append("title", title);
                    router.post(
                      route("admin.agents.documents.upload", { agent: agent.agent_id }),
                      formData,
                      {
                        onSuccess: () => {
                          toast("Document uploaded successfully!");
                          router.reload({ only: ["documents"] });
                        },
                        onError: (error) => {
                          console.error("Upload failed", error);
                        },
                      }
                    );
                  }}
                  onDeleteDocument={(docId) => deleteDocument(docId)}
                  onMoveDocument={(docId, newFolderId) => {
                    router.post(
                      route("admin.agents.documents.move", { agent: agent.agent_id, document: docId }),
                      { folder_id: newFolderId.toString() },
                      {
                        onSuccess: () => {
                          toast("Document moved successfully!");
                          router.reload({ only: ["documents"] });
                        },
                        onError: (error) => {
                          console.error("Move failed", error);
                        },
                      }
                    );
                  }}
                  onCreateFolder={(folderName, parentId) => {
                    router.post(
                      route("admin.agents.documents.folder.store", { agent: agent.agent_id }),
                      { name: folderName, parent_id: parentId },
                      {
                        onSuccess: () => {
                          toast("Folder created successfully!");
                          router.reload({ only: ["documents"] });
                        },
                        onError: (error) => {
                          console.error("Folder creation failed", error);
                        },
                      }
                    );
                  }}
                  onRenameDocument={(docId, newTitle) => {
                    renameDocument(docId, newTitle);
                  }}
                  onRequestDeleteDocument={handleRequestDeleteDocument}
                  onRequestDeleteFolder={handleRequestDeleteFolder}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note.id} className="border p-3 my-2 rounded-lg
                 bg-gray-100 dark:bg-gray-800
                flex justify-between">
                      <div>
                        <p>{note.content}</p>
                        <p className="text-sm text-gray-500">
                          By: {note.created_by} - {note.created_at}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={() => {
                        setNoteIdToDelete(note.id);
                        setDeleteNoteDialogOpen(true);
                      }}>
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p>No notes available.</p>
                )}
                <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">Add Note</Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="add-note-description">
                    <DialogHeader>
                      <DialogTitle>Add New Note</DialogTitle>
                      <DialogDescription id="add-note-description">
                        Enter your note below.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitNote} className="space-y-4">
                      <Textarea
                        placeholder="Enter note..."
                        value={noteData.content}
                        onChange={(e) => setNoteData("content", e.target.value)}
                      />
                      <Button type="submit">
                        {noteProcessing ? "Saving..." : "Save Note"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Note Confirmation Dialog */}
      <Dialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="delete-note-description">
          <DialogHeader>
            <DialogTitle>Confirm Note Deletion</DialogTitle>
            <DialogDescription id="delete-note-description">
              Are you sure you want to delete this note?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (noteIdToDelete !== null) {
                    deleteNote(noteIdToDelete);
                    setDeleteNoteDialogOpen(false);
                  }
                }}
              >
                Delete
              </Button>
              <Button onClick={() => setDeleteNoteDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="delete-folder-description">
          <DialogHeader>
            <DialogTitle>Confirm Folder Deletion</DialogTitle>
            <DialogDescription id="delete-folder-description">
              Are you sure you want to delete this folder?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (folderIdToDelete !== null) {
                    router.delete(
                      route("admin.agents.documents.folder.destroy", { folder: folderIdToDelete }),
                      {
                        onSuccess: () => {
                          toast("Folder deleted successfully!");
                          router.reload({ only: ["documents"] });
                          setDeleteFolderDialogOpen(false);
                        },
                        onError: (error) => {
                          console.error("Folder deletion failed", error);
                        },
                      }
                    );
                  }
                }}
              >
                Delete
              </Button>
              <Button onClick={() => setDeleteFolderDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
