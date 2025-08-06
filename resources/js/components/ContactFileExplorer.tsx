/* ContactFileExplorer – drag-&-drop, folders, navigation
   ------------------------------------------------------ */
import { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload as UploadIcon,
  FileText as FileIcon,
  Folder as FolderIcon,
} from "lucide-react";

/* ───────── types & props ───────── */
interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Doc {
  id: number;
  folder_id: number | null;
  title?: string | null;
  path: string;
}

interface Props {
  contactId: number;

  folders: Folder[];
  documents: Doc[];

  /* doc actions */
  onFileUpload: (file: File, folderId: number, title: string) => void;
  onDeleteDocument: (docId: number) => void;
  onMoveDocument: (docId: number, newFolderId: number) => void;
  onRenameDocument: (docId: number, newTitle: string) => void;

  /* folder actions */
  onCreateFolder: (name: string, parentId: number | null) => void;
  onRenameFolder: (folderId: number, name: string) => void;
  onMoveFolder?: (folderId: number, newParentId: number | null) => void; // optional
  onDeleteFolder: (folderId: number) => void;
}

/* ───────────────── component ───────────────── */
export default function ContactFileExplorer({
  contactId,
  folders,
  documents,
  onFileUpload,
  onDeleteDocument,
  onMoveDocument,
  onRenameDocument,
  onCreateFolder,
  onRenameFolder,
  onMoveFolder,
  onDeleteFolder,
}: Props) {
  /* virtual “General” root */
  const ROOT: Folder = { id: 0, name: "General", parent_id: null };
  const [stack, setStack] = useState<Folder[]>([ROOT]);
  const cur = stack.at(-1)!;

  /* dialogs ------------------------------------------------------ */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [upFile, setUpFile] = useState<File | null>(null);
  const [upTitle, setUpTitle] = useState("");

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [renameFileOpen, setRenameFileOpen] = useState(false);
  const [renameId, setRenameId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [renameFolderOpen, setRenameFolderOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<number | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");

  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [delFolderId, setDelFolderId] = useState<number | null>(null);

    /* state for move modal */
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveDocId, setMoveDocId] = useState<number | null>(null);

  /* simple context-menus ----------------------------------------- */
  const [ctxDoc, setCtxDoc] = useState<{ id: number; x: number; y: number } | null>(null);
  const [ctxFolder, setCtxFolder] = useState<{ id: number; x: number; y: number } | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const clear = () => {
      setCtxDoc(null);
      setCtxFolder(null);
    };
    window.addEventListener("click", clear);
    return () => window.removeEventListener("click", clear);
  }, []);

  /* items for current folder ------------------------------------- */
  const childFolders = folders.filter((f) =>
    cur.id === 0 ? f.parent_id === null : f.parent_id === cur.id
  );
  const childDocs = documents.filter((d) =>
    cur.id === 0 ? d.folder_id === null : d.folder_id === cur.id
  );

  const items = [
    ...childFolders.map((f) => ({ type: "folder" as const, ...f })),
    ...childDocs.map((d) => ({ type: "doc" as const, ...d })),
  ].sort((a, b) => {
    if (a.type === b.type) {
      const aName = a.type === "folder" ? a.name : a.title || a.path;
      const bName = b.type === "folder" ? b.name : b.title || b.path;
      return String(aName).localeCompare(String(bName));
    }
    return a.type === "folder" ? -1 : 1;
  });

  /* helpers ------------------------------------------------------- */
  const triggerUpload = () => {
    if (!upFile) return;
    onFileUpload(upFile, cur.id, upTitle);
    setUploadOpen(false);
    setUpFile(null);
    setUpTitle("");
  };

  const triggerNewFolder = () => {
    onCreateFolder(newName, cur.id === 0 ? null : cur.id);
    setNewOpen(false);
    setNewName("");
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <div className="flex flex-col h-full relative" ref={ref}>
      {/* header */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
        <div className="font-semibold">
          {cur.id === 0 ? "My Documents" : cur.name}
        </div>
        <div className="flex gap-2">
          {stack.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStack(stack.slice(0, -1))}
            >
              Back
            </Button>
          )}
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <UploadIcon className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNewOpen(true)}
          >
            New folder
          </Button>
        </div>
      </div>

      {/* grid */}
      <div className="flex-1 overflow-auto p-4">
        {items.length === 0 ? (
          <div
            className="h-full flex flex-col items-center justify-center
                       border-2 border-dashed rounded text-muted-foreground"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) {
                setUpFile(f);
                setUpTitle(f.name);
                setUploadOpen(true);
              }
            }}
          >
            <UploadIcon className="h-12 w-12 mb-4" />
            Drag files here or click Upload
          </div>
        ) : (
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))]
                       gap-4"
          >
            {items.map((item) =>
              item.type === "folder" ? (
                <div
                  key={`folder-${item.id}`}
                  className="flex flex-col items-center p-3 border rounded
                             cursor-pointer hover:bg-muted/50"
                  onClick={() => setStack([...stack, item])}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = ref.current?.getBoundingClientRect();
                    setCtxFolder({
                      id: item.id,
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                    });
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const docId = Number(e.dataTransfer.getData("doc"));
                    if (docId) onMoveDocument(docId, item.id);
                  }}
                >
                  <FolderIcon className="h-8 w-8 mb-1" />
                  <span className="truncate w-full text-center text-sm">
                    {item.name}
                  </span>
                </div>
              ) : (
                <div
                  key={`doc-${item.id}`}
                  className="flex flex-col items-center"
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("doc", String(item.id))
                  }
                  onDoubleClick={() =>
                    window.open(
                      route("admin.contacts.documents.view", {
                        contact: contactId,
                        document: item.id,
                      }),
                      "_blank"
                    )
                  }
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = ref.current?.getBoundingClientRect();
                    setCtxDoc({
                      id: item.id,
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                    });
                  }}
                >
                  <FileIcon className="h-10 w-10" />
                  <span className="mt-1 break-all text-xs text-center">
                    {item.title?.trim() || item.path.split("/").pop()}
                  </span>
                </div>
              )
            )}

            {/* inline drop zone */}
            <div
              className="border border-dashed rounded p-4 col-span-full
                         text-center text-sm"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) {
                  setUpFile(f);
                  setUpTitle(f.name);
                  setUploadOpen(true);
                }
              }}
            >
              Drag & drop here to upload
            </div>
          </div>
        )}
      </div>

      {/* ───── dialogs ───── */}
      {/* upload */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>
              Choose a file and (optionally) set a title.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setUpFile(f);
                setUpTitle(f.name);
              }
            }}
          />
          <Input
            placeholder="Title"
            value={upTitle}
            onChange={(e) => setUpTitle(e.target.value)}
          />
          <Button onClick={triggerUpload} disabled={!upFile}>
            Upload
          </Button>
        </DialogContent>
      </Dialog>

      {/* new folder */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={triggerNewFolder} disabled={!newName.trim()}>
            Create
          </Button>
        </DialogContent>
      </Dialog>

      {/* rename doc */}
      <Dialog open={renameFileOpen} onOpenChange={setRenameFileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename document</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
          />
          <Button
            onClick={() => {
              if (renameId !== null) {
                onRenameDocument(renameId, renameTitle);
                setRenameFileOpen(false);
              }
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      {/* rename folder */}
      <Dialog open={renameFolderOpen} onOpenChange={setRenameFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <Input
            value={renameFolderName}
            onChange={(e) => setRenameFolderName(e.target.value)}
          />
          <Button
            onClick={() => {
              if (renameFolderId !== null) {
                onRenameFolder(renameFolderId, renameFolderName);
                setRenameFolderOpen(false);
              }
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      {/* delete folder confirm */}
      <Dialog open={deleteFolderOpen} onOpenChange={setDeleteFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete folder?</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            All documents inside will be **permanently removed**.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteFolderOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (delFolderId !== null) {
                  onDeleteFolder(delFolderId);
                  setDeleteFolderOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ───── context menus ───── */}
      {ctxDoc && (
        <div
          className="absolute bg-white border rounded shadow text-sm z-50"
          style={{ top: ctxDoc.y, left: ctxDoc.x }}
        >
          <div
            className="px-3 py-1 cursor-pointer hover:bg-muted/50"
            onClick={() => {
              const doc = documents.find((d) => d.id === ctxDoc.id);
              setRenameId(ctxDoc.id);
              setRenameTitle(
                doc?.title?.trim() || doc?.path.split("/").pop() || ""
              );
              setRenameFileOpen(true);
              setCtxDoc(null);
            }}
          >
            Rename
          </div>
          <div
            className="px-3 py-1 cursor-pointer hover:bg-muted/50"
            onClick={() => {
              setMoveDocId(ctxDoc.id);
              setMoveOpen(true);
              setCtxDoc(null);
            }}
          >
            Move
          </div>
          <div
            className="px-3 py-1 cursor-pointer hover:bg-muted/50 text-red-600"
            onClick={() => {
              onDeleteDocument(ctxDoc.id);
              setCtxDoc(null);
            }}
          >
            Delete
          </div>
        </div>
      )}

      {ctxFolder && (
        <div
          className="absolute bg-white border rounded shadow text-sm z-50"
          style={{ top: ctxFolder.y, left: ctxFolder.x }}
        >
          <div
            className="px-3 py-1 cursor-pointer hover:bg-muted/50"
            onClick={() => {
              const f = folders.find((fl) => fl.id === ctxFolder.id);
              setRenameFolderId(ctxFolder.id);
              setRenameFolderName(f ? f.name : "");
              setRenameFolderOpen(true);
              setCtxFolder(null);
            }}
          >
            Rename
          </div>
          <div
            className="px-3 py-1 cursor-pointer hover:bg-muted/50 text-red-600"
            onClick={() => {
              setDelFolderId(ctxFolder.id);
              setDeleteFolderOpen(true);
              setCtxFolder(null);
            }}
          >
            Delete
          </div>
        </div>
      )}

      {/* move document modal (simple choose dest) */}
      <MoveDocModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        docId={moveDocId}
        folders={folders}
        onMove={(fid) => {
          if (moveDocId !== null) onMoveDocument(moveDocId, fid);
          setMoveOpen(false);
        }}
      />
    </div>
  );

  /* ---- Move-document modal (inner component) ---- */
  function MoveDocModal({
    open,
    onClose,
    docId,
    folders,
    onMove,
  }: {
    open: boolean;
    onClose: () => void;
    docId: number | null;
    folders: Folder[];
    onMove: (folderId: number) => void;
  }) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move document</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-auto">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onMove(0)}
            >
              General
            </Button>
            {folders.map((f) => (
              <Button
                key={f.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onMove(f.id)}
              >
                {f.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }


}
