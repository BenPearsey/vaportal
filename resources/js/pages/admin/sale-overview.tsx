// resources/js/pages/admin/sales/ShowSale.tsx
import React, { useState } from "react";
import {
  Head, Link, usePage, router, InertiaFormEvent,
} from "@inertiajs/react";

import AppLayout                              from "@/layouts/app-layout-admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button }                             from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input }                              from "@/components/ui/input";
import { toast }                              from "sonner";
import {
  FileText as FileIcon,
  Upload   as UploadIcon,
  Trash    as TrashIcon,
} from "lucide-react";

import SaleChecklist from "@/components/SaleChecklist";
import type { BreadcrumbItem } from "@/types";
import TrustChecklistPanel from "@/components/TrustChecklistPanel";


/* ──────────────────────────────────────────────────────────
   Minimal reusable notes list + add / delete actions
   (same UX as the Client page, but scoped to a sale)
   ────────────────────────────────────────────────────────── */
type Note = { id:number; content:string; created_at:string; created_by:string };

interface SaleNotesProps {
  saleId: number;
  notes:  Note[];
}

function SaleNotes({ saleId, notes }: SaleNotesProps) {
  const [dialogOpen,      setDialogOpen]      = React.useState(false);
  const [deleteDialog,    setDeleteDialog]    = React.useState(false);
  const [deleteId,        setDeleteId]        = React.useState<number|null>(null);
  const [noteContent,     setNoteContent]     = React.useState("");
  const [submitting,      setSubmitting]      = React.useState(false);

  /* add new note */
  const saveNote = () => {
    setSubmitting(true);
    router.post(route("admin.sales.notes.store", saleId),
      { content: noteContent },
      {
        onSuccess: () => {
          setNoteContent("");
          setDialogOpen(false);
          router.reload({ only: ["notes"] });
        },
        onFinish: () => setSubmitting(false),
      }
    );
  };

  /* delete */
  const confirmDelete = () => {
    if (deleteId == null) return;
    router.delete(route("admin.sales.notes.destroy", [saleId, deleteId]), {
      onSuccess: () => router.reload({ only: ["notes"] }),
      onFinish : () => { setDeleteDialog(false); setDeleteId(null); },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notes</CardTitle>
        <Button onClick={() => setDialogOpen(true)}>Add Note</Button>
      </CardHeader>
      <CardContent>

        {notes.length === 0 && <p>No notes yet.</p>}

        {notes.map(n => (
          <div key={n.id} className="border rounded p-3 my-2 flex justify-between bg-gray-50">
            <div>
              <p>{n.content}</p>
              <p className="text-xs text-gray-500">
                {n.created_by} – {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setDeleteId(n.id); setDeleteDialog(true); }}>
              <TrashIcon className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ))}

        {/* add‑note dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
            <textarea
              className="w-full border rounded p-2 h-28"
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
            />
            <Button disabled={submitting || !noteContent.trim()} onClick={saveNote}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogContent>
        </Dialog>

        {/* delete confirm dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete note?</DialogTitle></DialogHeader>
            <p>This can’t be undone.</p>
            <div className="flex gap-4">
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


/* ───────────────── Types ───────────────── */
interface Document {
  id:        number;
  path:      string;   // storage path
  title?:    string;   // nullable
}


interface SaleOverviewProps {
  sale: {
    sale_id: number;
    agent:  { id: number; firstname: string; lastname: string };
    client: { id: number; firstname: string; lastname: string; email: string; phone: string };
    carrier_info?: { name: string };
    product: string;
    total_sale_amount: number;
    commission: number;
    status: string;
    sale_date: string;
    checklist?: any[];
  };
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home",  href: route("admin.dashboard") },
  { title: "Sales", href: route("admin.sales")     },
];

/* ───────────────── Page ───────────────── */
export default function SaleOverview({ sale }: SaleOverviewProps) {
  const { documents = [], notes = [] } = usePage().props as {
    documents: Document[];
    notes:      Note[];
  };

  return (
    <AppLayout breadcrumbs={[ ...breadcrumbs, { title: `Sale #${sale.sale_id}`, href: "" } ]}>
      <Head title={`Sale #${sale.sale_id}`} />

      {/* Header row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sale #{sale.sale_id}</h1>
        <Link href={route("admin.sales.edit", sale.sale_id)}>
          <Button>Edit Sale</Button>
        </Link>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* ── Overview ───────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Agent:</strong>{" "}
                <Link href={route("admin.agents.overview", sale.agent.id)} className="text-blue-600 hover:underline">
                  {sale.agent.firstname} {sale.agent.lastname}
                </Link>
              </p>
              <p><strong>Client:</strong>{" "}
                <Link href={route("admin.clients.overview", sale.client.id)} className="text-blue-600 hover:underline">
                  {sale.client.firstname} {sale.client.lastname}
                </Link>
              </p>
              <p><strong>Email:</strong> {sale.client.email}</p>
              <p><strong>Phone:</strong> {sale.client.phone}</p>
              <p><strong>Carrier:</strong> {sale.carrier_info?.name ?? "—"}</p>
              <p><strong>Product:</strong> {sale.product}</p>
              <p><strong>Total Sale Amount:</strong>{" "}
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
                  .format(sale.total_sale_amount)}
              </p>
              <p><strong>Commission:</strong>{" "}
                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
                  .format(sale.commission)}
              </p>
              <p><strong>Status:</strong> {sale.status}</p>
              <p><strong>Sale Date:</strong> {new Date(sale.sale_date).toLocaleDateString()}</p>
            </CardContent>
          </Card>

              {/* Checklist card (now under details) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <SaleChecklist
                saleId={sale.sale_id}
                checklist={sale.checklist ?? []}
              />
            </CardContent>
          </Card>
          <Card className="mt-6">
<Card className="mt-6">
  <CardHeader><CardTitle>Checklist</CardTitle></CardHeader>
  <CardContent>
    {sale.product?.toLowerCase().includes('trust')
      ? <TrustChecklistPanel saleId={sale.sale_id} role="admin" />
      : <SaleChecklist saleId={sale.sale_id} checklist={sale.checklist ?? []} />
    }
  </CardContent>
</Card>

</Card>
        </TabsContent>

        {/* ── Documents (simple version) ─────────── */}
        <TabsContent value="documents">
          <SaleDocuments saleId={sale.sale_id} docs={documents} />
        </TabsContent>

         {/* ── Notes ──────────────────────────────── */}
        <TabsContent value="notes">
          <SaleNotes saleId={sale.sale_id} notes={notes} />
        </TabsContent>


      </Tabs>
    </AppLayout>
  );
}

/* ═══════════════════════════════════════════════
   Simple document uploader / viewer for Sales
   ═══════════════════════════════════════════════ */
interface DocsProps { saleId: number; docs: Document[]; }

function SaleDocuments({ saleId, docs }: DocsProps) {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [file,  setFile]  = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleUpload = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);

    router.post(route("admin.sales.documents.upload", saleId), fd, {
      onSuccess: () => {
        toast("Document uploaded!");
        setUploadDialog(false);
        setFile(null);
        setTitle("");
        router.reload({ only: ["documents"] });
      },
      onError: () => toast.error("Upload failed"),
    });
  };

  const deleteDoc = (id: number) =>
    router.delete(route("admin.sales.documents.destroy", [saleId, id]), {
      onSuccess: () => router.reload({ only: ["documents"] }),
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button onClick={() => setUploadDialog(true)}>
          <UploadIcon className="mr-2 h-4 w-4" /> Upload
        </Button>
      </CardHeader>

      <CardContent>
        {docs.length === 0 && <p>No documents uploaded yet.</p>}

        {/* simple grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {docs.map((d) => {
            const label = d.title?.trim() || d.path.split("/").pop() || "Untitled";
            return (
              <div key={d.id} className="flex flex-col items-center text-center">
                <FileIcon className="h-8 w-8 mb-1" />
                <span className="text-sm truncate max-w-[100px]">{label}</span>
                <div className="flex gap-2 mt-1">
                  <Button size="icon" variant="ghost"
                    onClick={() => window.open(route("admin.sales.documents.view", [saleId, d.id]), "_blank")}>
                    <UploadIcon className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteDoc(d.id)}>
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* upload dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Select the file and (optionally) give it a title.</DialogDescription>
          </DialogHeader>

          <Input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setFile(f); setTitle(f.name); }
            }}
          />
          <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />

          <Button disabled={!file} onClick={handleUpload}>Upload</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
