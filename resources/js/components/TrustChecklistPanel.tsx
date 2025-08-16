// resources/js/components/TrustChecklistPanel.tsx
import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
// If you use shadcn's dialog, these exist. Otherwise swap to your app's Modal.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Stage = { id:number; key:string; label:string; order:number; weight:number };

type ItemStateUI =
  | "todo" | "complete" | "pending_review" | "approved" | "rejected" | "na"
  | "waiting_on_client" | "blocked" | "not_started" | "in_progress" | "uploaded";

type LinkDTO = {
  id: number;
  review_state: "pending" | "approved" | "rejected";
  review_note?: string | null;
  document_id?: number;
  /** NEW: server now returns the sale document's title */
  document_title?: string | null;
};

type Item = {
  id: number;
  state: ItemStateUI;
  task: {
    key: string;
    label: string;
    action_type: string | null;
    requires_review: boolean;
    repeat_group?: string | null;
    stage: Stage;
  };
  parent_item_id?: number | null;
  links: LinkDTO[];
};

type Summary = { exists: boolean; progress: number; stages: Stage[]; items: Item[] };

/* ── UI helpers ─────────────────────────────────────────────────────────── */
function StatusChip({ state }: { state: ItemStateUI }) {
  const map: Record<ItemStateUI, { label: string; cls: string }> = {
    todo:              { label: "To do",             cls: "border" },
    not_started:       { label: "To do",             cls: "border" },
    in_progress:       { label: "To do",             cls: "border" },
    uploaded:          { label: "Pending review",    cls: "bg-amber-500 text-white" },
    pending_review:    { label: "Pending review",    cls: "bg-amber-500 text-white" },
    waiting_on_client: { label: "Waiting on client", cls: "bg-blue-100 text-blue-700" },
    blocked:           { label: "Hidden",            cls: "bg-gray-100 text-gray-700" },
    approved:          { label: "Approved",          cls: "bg-emerald-600 text-white" },
    rejected:          { label: "Changes requested", cls: "bg-rose-600 text-white" },
    complete:          { label: "Complete",          cls: "bg-green-600 text-white" },
    na:                { label: "N/A",               cls: "bg-gray-200 text-gray-700" },
  };
  const v = map[state] ?? map.todo;
  return <span className={`text-xs px-2 py-1 rounded ${v.cls}`}>{v.label}</span>;
}

function getCookie(name: string): string {
  return document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="))?.split("=")[1] ?? "";
}
function getCsrfHeader():
  | { header: "X-CSRF-TOKEN" | "X-XSRF-TOKEN"; token: string }
  | null {
  const meta = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;
  if (meta) return { header: "X-CSRF-TOKEN", token: meta };
  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) return { header: "X-XSRF-TOKEN", token: decodeURIComponent(xsrf) };
  return null;
}

/** Treat as upload when the type says 'upload' OR the step is clearly a reviewed client doc. */
function looksLikeUpload(it: Item): boolean {
  const t = it.task;
  const type = (t.action_type || "").toLowerCase();
  if (type === "upload") return true;
  const text = `${t.key} ${t.label}`.toLowerCase();
  if (/(upload|uploaded|uploading)/.test(text)) return true;
  if (t.requires_review && /(id|ids|document|intake|certificate|photo|passport|driver)/.test(text)) return true;
  return false;
}

/* ── Reusable dialogs ───────────────────────────────────────────────────── */
type ConfirmState = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
};
function ConfirmDialog({ state, onOpenChange }: { state: ConfirmState; onOpenChange: (open:boolean)=>void }) {
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <button className="absolute right-3 top-3 opacity-60 hover:opacity-100" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          <DialogDescription>{state.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant={state.tone === "destructive" ? "destructive" : "default"}
            onClick={() => { state.onConfirm(); onOpenChange(false); }}
          >
            {state.confirmLabel}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type RejectState = { open: boolean; title: string; description?: string; onSubmit: (note: string)=>void };
function RequestChangesDialog({ state, onOpenChange }: { state: RejectState; onOpenChange:(open:boolean)=>void }) {
  const [note, setNote] = React.useState("");
  React.useEffect(()=>{ if(state.open) setNote(""); }, [state.open]);
  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <button className="absolute right-3 top-3 opacity-60 hover:opacity-100" onClick={() => onOpenChange(false)}>
          <X className="h-4 w-4" />
        </button>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
          {state.description && <DialogDescription>{state.description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-2">
          <label className="text-xs text-muted-foreground">Message to client (optional)</label>
          <textarea
            className="mt-1 w-full min-h-[96px] rounded border bg-background p-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Briefly explain what needs to be changed…"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="destructive" onClick={() => { state.onSubmit(note.trim()); onOpenChange(false); }}>
            Send request
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function TrustChecklistPanel({
  saleId,
  role = "admin",
}: {
  saleId: number;
  role?: "admin" | "agent" | "client";
}) {
  const base = role === "admin" ? `/admin/sales/${saleId}` : `/${role}/sales/${saleId}`;

  const [data, setData] = React.useState<Summary | null>(null);
  const [busyIds, setBusyIds] = React.useState<Set<number>>(new Set());
  const [busyRecalc, setBusyRecalc] = React.useState(false);
  const [openIds, setOpenIds] = React.useState<Set<number>>(new Set()); // expanded “Manage” panels
  const [confirm, setConfirm] = React.useState<ConfirmState | null>(null);
  const [rejectDlg, setRejectDlg] = React.useState<RejectState | null>(null);
  const filePickers = React.useRef<Record<number, HTMLInputElement | null>>({});

  const postJSON = React.useCallback(async (url: string, payload: any = {}) => {
    const csrf = getCsrfHeader();
    const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" };
    if (csrf) headers[csrf.header] = csrf.token;
    const res = await fetch(url, { method: "POST", headers, credentials: "same-origin", body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  }, []);

  const postForm = React.useCallback(async (url: string, form: FormData) => {
    const csrf = getCsrfHeader();
    const headers: Record<string, string> = { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" };
    if (csrf) headers[csrf.header] = csrf.token;
    const res = await fetch(url, { method: "POST", headers, credentials: "same-origin", body: form });
    if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  }, []);

  const load = React.useCallback(async () => {
    const res = await fetch(`${base}/checklist`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
    if (!res.ok) throw new Error("Failed to fetch checklist");
    setData(await res.json());
  }, [base]);

  const recalc = React.useCallback(async () => {
    if (role !== "admin") return;
    setBusyRecalc(true);
    try {
      await postJSON(`${base}/checklist/recalc`);
      await load();
    } finally { setBusyRecalc(false); }
  }, [role, base, postJSON, load]);

  const setState = React.useCallback(
    async (id: number, state: ItemStateUI) => {
      if (role !== "admin") return;
      setBusyIds((prev) => new Set(prev).add(id));
      try {
        const serverState = state === "todo" ? "not_started" : state;
        await postJSON(`${base}/checklist/items/${id}/state`, { state: serverState });
        await load();
      } finally {
        setBusyIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    },
    [role, base, postJSON, load]
  );

  /** Upload one or many files for an item (client/agent UI). */
  const uploadForItem = React.useCallback(
    async (id: number, files: File[]) => {
      if (role === "admin" || files.length === 0) return;
      setBusyIds((prev) => new Set(prev).add(id));
      try {
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("title", file.name);
          await postForm(`${base}/checklist/items/${id}/upload`, fd);
        }
        await load();
      } finally {
        setBusyIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      }
    },
    [role, base, postForm, load]
  );

  /** Approve / reject a single uploaded document (link), with optional note on reject. */
  const review = React.useCallback(
    async (itemId: number, linkId: number, decision: "approved" | "rejected", note?: string) => {
      if (role !== "admin") return;
      setBusyIds((prev) => new Set(prev).add(itemId));
      try {
        await postJSON(`${base}/checklist/items/${itemId}/review`, { link_id: linkId, decision, note: note ?? null });
        await load();
      } finally {
        setBusyIds((prev) => { const n = new Set(prev); n.delete(itemId); return n; });
      }
    },
    [role, base, postJSON, load]
  );

  /** Bulk operations for an item */
  const approveAllPending = React.useCallback(async (it: Item) => {
    const pend = it.links.filter((l) => l.review_state === "pending");
    if (pend.length === 0) return;
    setConfirm({
      open: true,
      title: "Approve all pending files?",
      description: `This will approve ${pend.length} document(s) for “${it.task.label}”.`,
      confirmLabel: "Yes, approve all",
      onConfirm: async () => { for (const l of pend) await review(it.id, l.id, "approved"); },
    });
  }, [review]);

  const requestChangesAll = React.useCallback(async (it: Item) => {
    const pend = it.links.filter((l) => l.review_state === "pending");
    if (pend.length === 0) return;
    setRejectDlg({
      open: true,
      title: `Request changes (${pend.length} files)`,
      description: `Send a single message that applies to all pending document(s) for “${it.task.label}”.`,
      onSubmit: async (note) => { for (const l of pend) await review(it.id, l.id, "rejected", note || undefined); },
    });
  }, [review]);

  // ── memoized data (declare BEFORE any early return!)
  const stagesSorted = React.useMemo<Stage[]>(() => {
    if (!data?.stages) return [];
    return [...data.stages].sort((a, b) => a.order - b.order);
  }, [data?.stages]);

  const itemsByStage = React.useMemo<Record<number, Item[]>>(() => {
    const map: Record<number, Item[]> = {};
    if (!data?.items) return map;
    for (const it of data.items) {
      if (it.parent_item_id) continue;
      (map[it.task.stage.id] ??= []).push(it);
    }
    return map;
  }, [data?.items]);

  const roleProgress = React.useMemo(() => {
    if (!data) return 0;
    if (role === "admin") return data.progress;
    const terminal = new Set<ItemStateUI>(["complete", "approved", "na"]);
    const total = data.stages.length || 1;
    let done = 0;
    for (const st of data.stages) {
      const items = data.items.filter((i) => i.task.stage.id === st.id && !i.parent_item_id);
      const allDone = items.length > 0 && items.every((i) => terminal.has(i.state));
      if (allDone) done++;
    }
    return Math.round((done / total) * 100);
  }, [data, role]);

  React.useEffect(() => {
    (async () => {
      await fetch(`${base}/checklist/ensure`, { headers: { Accept: "application/json" }, credentials: "same-origin" });
      await load();
    })();
  }, [base, load]);

  if (!data) return null;

  const toggleOpen = (id: number) =>
    setOpenIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CardTitle>Trust Checklist</CardTitle>
          {role === "admin" && (
            <Button size="sm" variant="outline" onClick={recalc} disabled={busyRecalc}>
              {busyRecalc ? "Recalc…" : "Recalc"}
            </Button>
          )}
        </div>
        <div className="w-48">
          {/* Dark‑mode friendly bar */}
          <Progress value={roleProgress} className="dark:bg-white/20 dark:[&>div]:bg-white" />
          <div className="text-xs text-muted-foreground mt-1">{roleProgress}%</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {stagesSorted.map((stage) => {
          const items = itemsByStage[stage.id] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={stage.id}>
              <div className="font-semibold mb-2">{stage.label}</div>
              <ul className="space-y-2">
                {items.map((it) => {
                  const dotColor =
                    it.state === "approved" || it.state === "complete" ? "var(--primary)"
                    : it.state === "pending_review" || it.state === "uploaded" ? "orange"
                    : it.state === "rejected" ? "crimson"
                    : "#aaa";

                  const itemBusy = busyIds.has(it.id);
                  const canToggle = role === "admin";
                  const isUpload = looksLikeUpload(it);

                  // Consolidated counts for admin
                  const counts = it.links.reduce(
                    (acc, l) => { acc.total++; (acc as any)[l.review_state]++; return acc; },
                    { total: 0, approved: 0, pending: 0, rejected: 0 } as { total:number; approved:number; pending:number; rejected:number; }
                  );

                  return (
                    <li key={it.id} className="text-sm border rounded px-3 py-2" aria-busy={itemBusy}>
                      {/* Top row: status dot, label, chip, summary, quick actions */}
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title={canToggle ? "Toggle complete" : ""}
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ background: dotColor, cursor: canToggle ? "pointer" : "default", opacity: itemBusy ? 0.6 : 1 }}
                            disabled={!canToggle || itemBusy}
                            onClick={() => {
                              if (!canToggle || itemBusy) return;
                              const next = it.state === "complete" ? "not_started" : "complete";
                              // Styled confirm dialog (matches your screenshot)
                              setConfirm({
                                open: true,
                                title: next === "complete" ? "Mark step complete?" : "Re-open step?",
                                description:
                                  next === "complete"
                                    ? `Are you sure you want to mark “${it.task.label}” complete?`
                                    : `Are you sure you want to mark “${it.task.label}” not started?`,
                                confirmLabel: next === "complete" ? "Yes, mark complete" : "Yes, re-open",
                                onConfirm: () => setState(it.id, next as ItemStateUI),
                              });
                            }}
                          />
                          <span className="font-medium">{it.task.label}</span>
                          {it.task.requires_review && <span className="text-xs text-muted-foreground">(review)</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusChip state={it.state} />
                          {role === "admin" && isUpload && counts.total > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground mr-1">Uploads: {counts.total}</span>
                              {counts.approved > 0 && (
                                <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-600 text-white">{counts.approved} approved</span>
                              )}
                              {counts.pending > 0 && (
                                <span className="text-[10px] px-1 py-0.5 rounded bg-amber-500 text-white">{counts.pending} pending</span>
                              )}
                              {counts.rejected > 0 && (
                                <span className="text-[10px] px-1 py-0.5 rounded bg-rose-600 text-white">{counts.rejected} changes</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="justify-self-end flex items-center gap-2">
                          {role === "admin" && isUpload && (
                            <Button
                              size="sm"
                              variant={openIds.has(it.id) ? "default" : "outline"}
                              onClick={() => toggleOpen(it.id)}
                            >
                              {openIds.has(it.id) ? "Hide" : "Manage"}
                            </Button>
                          )}

                          {role === "admin" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={itemBusy}
                              onClick={() =>
                                setConfirm({
                                  open: true,
                                  title: "Mark as N/A?",
                                  description: `Are you sure you want to mark “${it.task.label}” as Not Applicable?`,
                                  confirmLabel: "Yes, mark N/A",
                                  tone: "destructive",
                                  onConfirm: () => setState(it.id, "na"),
                                })
                              }
                            >
                              Mark N/A
                            </Button>
                          )}

                          {/* Agent/Client: upload (multiple) */}
                          {role !== "admin" && isUpload && (it.state === "waiting_on_client" || it.state === "rejected") && (
                            <>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={(el) => (filePickers.current[it.id] = el)}
                                onChange={(e) => {
                                  const fs = Array.from(e.target.files ?? []);
                                  if (fs.length) uploadForItem(it.id, fs);
                                  if (filePickers.current[it.id]) filePickers.current[it.id]!.value = "";
                                }}
                              />
                              <Button size="sm" disabled={itemBusy} onClick={() => filePickers.current[it.id]?.click()}>
                                {it.state === "rejected" ? "Upload new file(s)" : "Upload file(s)"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded admin panel for per‑file actions (collapsed by default) */}
                      {role === "admin" && isUpload && openIds.has(it.id) && (
                        <div className="mt-2 rounded border bg-muted/10 p-2 space-y-2">
                          {/* Bulk actions */}
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => approveAllPending(it)} disabled={it.links.every(l => l.review_state !== "pending")}>
                              Approve all pending
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => requestChangesAll(it)} disabled={it.links.every(l => l.review_state !== "pending")}>
                              Request changes (all pending)
                            </Button>
                          </div>

                          {/* Per‑file rows with file names */}
                          <div className="space-y-1">
                            {it.links.map((link) => {
                              const pill =
                                link.review_state === "approved" ? "bg-emerald-600 text-white"
                                : link.review_state === "rejected" ? "bg-rose-600 text-white"
                                : "bg-amber-500 text-white";
                              const title = link.document_title || (typeof link.document_id === "number" ? `Document #${link.document_id}` : "Document");
                              return (
                                <div key={link.id} className="flex items-center justify-between rounded border bg-white/50 dark:bg-zinc-900/40 px-2 py-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="truncate max-w-[22rem]" title={title}>{title}</span>
                                    <span className={`text-[10px] px-1 py-0.5 rounded ${pill}`}>{link.review_state}</span>
                                    {link.review_note && (
                                      <span className="text-[11px] text-muted-foreground italic truncate max-w-[16rem]" title={link.review_note}>
                                        “{link.review_note}”
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {typeof link.document_id === "number" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(`/admin/sales/${saleId}/documents/${link.document_id}/view`, "_blank")}
                                      >
                                        View
                                      </Button>
                                    )}
                                    {link.review_state !== "approved" && (
                                      <Button size="sm" onClick={() => review(it.id, link.id, "approved")}>
                                        Approve
                                      </Button>
                                    )}
                                    {link.review_state !== "rejected" && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setRejectDlg({
                                          open: true,
                                          title: "Request changes",
                                          description: `Send a message for “${title}”.`,
                                          onSubmit: (note) => review(it.id, link.id, "rejected", note || undefined),
                                        })}
                                      >
                                        Request changes
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {it.links.length === 0 && (
                              <div className="text-xs text-muted-foreground">No documents uploaded yet.</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Non‑admin waiting hints */}
                      {role !== "admin" && (it.state === "blocked" || it.state === "todo" || it.state === "not_started" || it.state === "in_progress") && (
                        <div className="mt-1 text-xs text-muted-foreground">Waiting for admin…</div>
                      )}
                      {role !== "admin" && (it.state === "pending_review" || it.state === "uploaded") && (
                        <div className="mt-1 text-xs text-muted-foreground">Waiting for admin review…</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </CardContent>

      {/* Dialogs (shared) */}
      {confirm && (
        <ConfirmDialog
          state={confirm}
          onOpenChange={(open) => setConfirm((prev) => prev ? { ...prev, open } : prev)}
        />
      )}
      {rejectDlg && (
        <RequestChangesDialog
          state={rejectDlg}
          onOpenChange={(open) => setRejectDlg((prev) => prev ? { ...prev, open } : prev)}
        />
      )}
    </Card>
  );
}
