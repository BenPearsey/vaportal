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
import { Client } from "@/types/client";
import { ClientDocument } from "@/types/document";
import { ClientNote } from "@/types/note";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  EyeIcon,
  TrashIcon,
  Upload as UploadIcon,
  FileText as FileIcon,
  Folder as FolderIcon,
} from "lucide-react";

// Assume Agent type exists; adjust as needed.
import { Agent } from "@/types/agent";


const mask = (val?: string | null, visible = 4) =>
  val ? "•••• " + val.slice(-visible) : "N/A";

// -------------------------------------------------------
// Interfaces
// -------------------------------------------------------
interface FormErrors {
  [field: string]: string[];
}

interface ClientFormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  dob: string;
  status: "Prospect" | "Active" | "Inactive";
  agent_id: string;
}

// Folder interface includes subfolder support.
interface Folder {
  id: number;
  name: string;
  parent_id?: number | null;
}

// -------------------------------------------------------
// FileExplorer Component (Combined view for Folders & Documents)
// -------------------------------------------------------
interface FileExplorerProps {
  clientId: number;
  folders: Folder[];
  documents: ClientDocument[];
  onFileUpload: (file: File, folderId: number, title: string) => void;
  onDeleteDocument: (docId: number) => void;
  onMoveDocument: (docId: number, newFolderId: number) => void;
  onCreateFolder: (folderName: string, parentId?: number | null) => void;
  onRenameDocument: (docId: number, newTitle: string) => void;
  onRequestDeleteDocument: (docId: number) => void;
  onRequestDeleteFolder: (folderId: number) => void;
}

function FileExplorer({
  clientId,
  folders,
  documents,
  onFileUpload,
  onDeleteDocument,
  onMoveDocument,
  onCreateFolder,
  onRenameDocument,
  onRequestDeleteDocument,
  onRequestDeleteFolder,
}: FileExplorerProps) {
  // Virtual root folder is used for navigation (it isn’t a real folder in the DB)
  const virtualRoot: Folder = { id: 0, name: "General", parent_id: null };

  // Use folderPath for navigation; initial value is the virtual root.
  const [folderPath, setFolderPath] = useState<Folder[]>([virtualRoot]);
  const currentFolder = folderPath[folderPath.length - 1];

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  // New Folder dialog state
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Document context menu state
  const [contextMenu, setContextMenu] = useState<{ docId: number; x: number; y: number } | null>(null);

  // Rename document dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameDocId, setRenameDocId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  // Move document dialog state
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDocId, setMoveDocId] = useState<number | null>(null);

  // Folder context menu state for existing folders
  const [folderContextMenu, setFolderContextMenu] = useState<{ folderId: number; x: number; y: number } | null>(null);

  // Rename folder dialog state
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<number | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  // Container ref for positioning context menus
  const containerRef = useRef<HTMLDivElement>(null);

  // Displayed folders: when at the root, show folders where parent_id is null; otherwise, show folders with parent_id equal to current folder id.
  const displayedFolders = folders.filter((folder) => {
    if (currentFolder.id === 0) {
      return folder.parent_id === null;
    } else {
      return folder.parent_id === currentFolder.id;
    }
  });

  // Filter documents: when at root, show documents with folder_id null; otherwise, those with folder_id equal to current folder id.
  const filteredDocs =
    currentFolder.id === 0
      ? documents.filter((doc) => doc.folder_id === null)
      : documents.filter((doc) => doc.folder_id === currentFolder.id);

  // Combine items so that folders appear first, then documents.
  const combinedItems = [
    ...displayedFolders.map((folder) => ({ type: "folder", ...folder })),
    ...filteredDocs.map((doc) => ({ type: "document", ...doc })),
  ];

  // Sort combinedItems: folders come first, then documents; sort alphabetically.
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
      // Always send folder_id even if 0 (backend will treat "0" as false and set null)
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

      {/* Combined Items Grid */}
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
                        route("admin.clients.documents.view", { client: clientId, document: item.id }),
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
                    route("admin.clients.documents.folder.rename", { folder: renameFolderId }),
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
            {/* Include a "General" option */}
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

// ------------------------------
// Main ClientOverview Component
// ------------------------------
export default function ClientOverview() {
  const {
    client,
    documents = [],
    notes = [],
    folders = [],
    agents = [],
    sales = [],
  } = usePage().props as {
    client?: Client;
    documents?: ClientDocument[];
    notes?: ClientNote[];
    folders?: Folder[];
    agents?: Agent[];
    sales?: any[];
  };

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [noteIdToDelete, setNoteIdToDelete] = useState<number | null>(null);

  // Document deletion confirmation state
  const [deleteDocDialogOpen, setDeleteDocDialogOpen] = useState(false);
  const [docIdToDelete, setDocIdToDelete] = useState<number | null>(null);

  // Folder deletion confirmation state
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [folderIdToDelete, setFolderIdToDelete] = useState<number | null>(null);


  // ⬇︎ NEW
const [showFullBanking, setShowFullBanking] = useState(false);

  const {
    data: noteData,
    setData: setNoteData,
    post: postNote,
    processing: noteProcessing,
    reset: resetNote,
  } = useForm({
    content: "",
    client_id: client?.client_id || 0,
  });

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.client_id) return;
    postNote(route("admin.clients.notes.store", { client: client.client_id }), {
      onSuccess: () => {
        toast("Note added successfully!");
        resetNote("content");
        setNoteDialogOpen(false);
        router.reload({ only: ["notes"] });
      },
    });
  };

  const deleteNote = (noteId: number) => {
    if (!client?.client_id) return;
    router.delete(
      route("admin.clients.notes.destroy", {
        client: client.client_id,
        note: noteId,
      }),
      {
        onSuccess: () => {
          toast("Note deleted!");
          router.reload({ only: ["notes"] });
        },
      }
    );
  };

  const deleteDocument = (docId: number) => {
    if (!client?.client_id) return;
    router.delete(
      route("admin.clients.documents.destroy", {
        client: client.client_id,
        document: docId,
      }),
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
      route("admin.clients.documents.rename", { client: client.client_id, document: docId }),
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

  // Handlers to trigger deletion confirmation dialogs from FileExplorer
  const handleRequestDeleteDocument = (docId: number) => {
    setDocIdToDelete(docId);
    setDeleteDocDialogOpen(true);
  };

  const handleRequestDeleteFolder = (folderId: number) => {
    setFolderIdToDelete(folderId);
    setDeleteFolderDialogOpen(true);
  };

  if (!client) {
    return (
      <AppLayout>
        <Head title="Client Not Found" />
        <div className="p-6 text-center text-red-500">
          <p>Client data is missing. Please check the backend response.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title={`Client Overview - ${client.firstname} ${client.lastname}`} />
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {client.firstname} {client.lastname}
          </h1>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Edit Client</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Client</DialogTitle>
                </DialogHeader>
                <EditClientForm client={client} agents={agents} />
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
  {/* --- two‑column grid on desktop, stacked on mobile --- */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

    {/* ───── Client Details ───── */}
    <Card>
      <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
      <CardContent>
        <p><strong>Email:</strong> {client.email}</p>
        <p><strong>Phone:</strong> {client.phone || "N/A"}</p>
        <p><strong>Status:</strong> {client.status}</p>
        <p><strong>Address:</strong> {client.address || "N/A"}</p>
        <p><strong>City:</strong> {client.city || "N/A"}</p>
        <p><strong>State:</strong> {client.state || "N/A"}</p>
        <p><strong>Zip Code:</strong> {client.zipcode || "N/A"}</p>
        <p><strong>Date of Birth:</strong> {client.dob || "N/A"}</p>
        {client.agent && (
          <p>
            <strong>Agent:</strong>{" "}
            <Link
              href={route("admin.agents.overview", { agent: client.agent.agent_id })}
              className="text-blue-500"
            >
              {client.agent.firstname} {client.agent.lastname}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>

    {/* ───── Banking Details ───── */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Banking Details</CardTitle>

    {/* toggle button */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowFullBanking(!showFullBanking)}
    >
      {showFullBanking ? "Hide numbers" : "Show full numbers"}
    </Button>
  </CardHeader>

  <CardContent>
    <p><strong>Bank:</strong> {client.bank_name ?? "N/A"}</p>
    <p><strong>Account&nbsp;Type:</strong> {client.account_type ?? "N/A"}</p>
    <p><strong>Account&nbsp;Holder:</strong> {client.account_holder ?? "N/A"}</p>

    {/* use raw or masked based on toggle */}
    <p>
      <strong>Routing #:</strong>{" "}
      {showFullBanking ? client.routing_number ?? "N/A" : mask(client.routing_number)}
    </p>
    <p>
      <strong>Account #:</strong>{" "}
      {showFullBanking ? client.account_number ?? "N/A" : mask(client.account_number)}
    </p>
  </CardContent>
</Card>

  </div>

  {/* ───── Sales grid (unchanged) ───── */}
  {sales.length > 0 && (
    <>
      <h3 className="mt-6 text-lg font-semibold">Sales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {sales.map(s => (
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
</TabsContent>


          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <FileExplorer
                  clientId={client.client_id}
                  folders={folders}
                  documents={documents}
                  onFileUpload={(file, folderId, title) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    // Always append folder_id (even if 0) so that the backend gets the value.
                    formData.append("folder_id", folderId.toString());
                    formData.append("title", title);
                    router.post(
                      route("admin.clients.documents.upload", { client: client.client_id }),
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
                      route("admin.clients.documents.move", { client: client.client_id, document: docId }),
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
                      route("admin.clients.documents.folder.store", { client: client.client_id }),
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
                    <div
                      key={note.id}
                      className="border p-3 my-2 rounded-lg bg-gray-100 flex justify-between"
                    >
                      <div>
                        <p>{note.content}</p>
                        <p className="text-sm text-gray-500">
                          By: {note.created_by} - {note.created_at}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setNoteIdToDelete(note.id);
                          setDeleteNoteDialogOpen(true);
                        }}
                      >
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

      {/* Delete Document Confirmation Dialog */}
      <Dialog open={deleteDocDialogOpen} onOpenChange={setDeleteDocDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto" aria-describedby="delete-doc-description">
          <DialogHeader>
            <DialogTitle>Confirm Document Deletion</DialogTitle>
            <DialogDescription id="delete-doc-description">
              Are you sure you want to delete this document?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (docIdToDelete !== null) {
                    deleteDocument(docIdToDelete);
                    setDeleteDocDialogOpen(false);
                  }
                }}
              >
                Delete
              </Button>
              <Button onClick={() => setDeleteDocDialogOpen(false)}>Cancel</Button>
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
                      route("admin.clients.documents.folder.destroy", { folder: folderIdToDelete }),
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

// ------------------------------
// Edit Client Form with Agent Dropdown
// ------------------------------
interface EditClientFormProps {
  client: Client;
  agents: Agent[];
}

function EditClientForm({ client, agents }: EditClientFormProps) {
  type EditFormData = {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    dob: string;
    status: "Prospect" | "Active" | "Inactive";
    agent_id: string;
    bank_name: string;
    account_type: string;
    account_holder: string;
    routing_number: string;
    account_number: string;
  };

  type EditFormErrors = {
    [field: string]: string[];
  };

  const { data, setData, put, processing, errors } = useForm<EditFormData, EditFormErrors>({
    firstname: client.firstname,
    lastname: client.lastname,
    email: client.email,
    phone: client.phone || "",
    address: client.address || "",
    city: client.city || "",
    state: client.state || "",
    zipcode: client.zipcode || "",
    dob: client.dob || "",
    status: client.status as "Prospect" | "Active" | "Inactive",
    agent_id: client.agent_id ? String(client.agent_id) : "",
    bank_name:      client.bank_name      || "",
    account_type:   client.account_type   || "",
    account_holder: client.account_holder || "",
    routing_number: client.routing_number || "",
    account_number: client.account_number || "",
  });

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route("admin.clients.update", client.client_id), {
      onSuccess: () => window.location.reload(),
      onError: (err) => {
        console.error("Update failed", err);
      },
    });
  };

  return (
    <form onSubmit={submitEdit} className="space-y-4">
      <Input placeholder="First Name" value={data.firstname} onChange={(e) => setData("firstname", e.target.value)} />
      <Input placeholder="Last Name" value={data.lastname} onChange={(e) => setData("lastname", e.target.value)} />
      <Input placeholder="Email" value={data.email} onChange={(e) => setData("email", e.target.value)} />
      <Input placeholder="Phone" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
      <Input placeholder="Address" value={data.address} onChange={(e) => setData("address", e.target.value)} />
      <Input placeholder="City" value={data.city} onChange={(e) => setData("city", e.target.value)} />
      <Input placeholder="State" value={data.state} onChange={(e) => setData("state", e.target.value)} />
      <Input placeholder="Zip Code" value={data.zipcode} onChange={(e) => setData("zipcode", e.target.value)} />
      <Input type="date" placeholder="Date of Birth" value={data.dob} onChange={(e) => setData("dob", e.target.value)} />
      <select value={data.status} onChange={(e) => setData("status", e.target.value as "Prospect" | "Active" | "Inactive")} className="border rounded p-2 w-full">
        <option value="Prospect">Prospect</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      <select
        value={data.agent_id}
        onChange={(e) => setData("agent_id", e.target.value)}
        className="border rounded p-2 w-full"
      >
        <option value="">Select an Agent</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.firstname} {agent.lastname}
          </option>
        ))}
      </select>

 {/* ── NEW banking section ───────────────────── */}
      <div className="pt-2 border-t">
        <h4 className="font-semibold mb-2">Banking Details</h4>

        <Input placeholder="Bank Name" value={data.bank_name}
               onChange={e => setData("bank_name", e.target.value)} />

        <select value={data.account_type}
                onChange={e => setData("account_type", e.target.value)}
                className="border rounded p-2 w-full">
          <option value="">Account Type</option>
          <option value="Checking">Checking</option>
          <option value="Savings">Savings</option>
          <option value="Other">Other</option>
        </select>

        <Input placeholder="Account Holder" value={data.account_holder}
               onChange={e => setData("account_holder", e.target.value)} />

        <Input placeholder="Routing #" value={data.routing_number}
               onChange={e => setData("routing_number", e.target.value)} />

        <Input placeholder="Account #" value={data.account_number}
               onChange={e => setData("account_number", e.target.value)} />
      </div>

      {errors && (
        <div className="text-red-500">
          {Object.keys(errors).map((field) => {
            const fieldErrors = errors[field];
            return fieldErrors?.map((msg, i) => <p key={field + i}>{msg}</p>);
          })}
        </div>
      )}
      <Button type="submit">{processing ? "Saving..." : "Save Changes"}</Button>
    </form>
  );
}
