import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/* ── Types ───────────────────────────────────────────── */
type Stage = { id: number; key: string; label: string; order: number; weight: number };

type RawState =
  | "not_started"
  | "in_progress"
  | "waiting_on_client"
  | "uploaded"
  | "pending_review"
  | "approved"
  | "rejected"
  | "blocked"
  | "complete"
  | "na"
  | "todo";

type ItemStateUI = "todo" | "pending_review" | "approved" | "rejected" | "complete" | "na";

type Item = {
  id: number;
  state: RawState;
  task: {
    key: string;
    label: string;
    action_type: string | null;
    requires_review: boolean;
    stage: Stage;
  };
  parent_item_id?: number | null;
  links: { id: number; review_state: string; review_note?: string | null }[];
};

type SaleMeta = {
  id: number;
  number?: number | string | null;
  created_at?: string | null;
  contracted_at?: string | null;
  reference?: string | null;
  product_label?: string | null;
  product_name?: string | null;
  product?: string | null;
};

type Summary = {
  exists: boolean;
  progress: number;
  stages: Stage[];
  items: Item[];
  sale?: SaleMeta | null;
  created_at?: string | null;
  checklist_created_at?: string | null;
};

type TitleMeta = { productLabel?: string | null; date?: string | null };

type Props = {
  saleId: number;
  role?: "client" | "agent" | "admin";
  onlyStageKeys?: string[];
  showCompleteOnce?: boolean;
  /** NEW: prefer this product label/date for the card title when provided */
  titleMeta?: TitleMeta;
};

/* ── Helpers ─────────────────────────────────────────── */
const TERMINAL = new Set<ItemStateUI>(["complete", "approved", "na"]);

function toUiState(s: RawState): ItemStateUI {
  switch (s) {
    case "uploaded":
    case "pending_review":
      return "pending_review";
    case "approved":
    case "rejected":
    case "complete":
    case "na":
      return s;
    default:
      return "todo";
  }
}
function getCookie(name: string): string {
  return document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith(name + "="))?.split("=")[1] ?? "";
}
function getCsrf() {
  const meta = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content;
  if (meta) return { header: "X-CSRF-TOKEN", token: meta };
  const xsrf = getCookie("XSRF-TOKEN");
  if (xsrf) return { header: "X-XSRF-TOKEN", token: decodeURIComponent(xsrf) };
  return null;
}
function isClientUpload(it: Item): boolean {
  const type = (it.task.action_type || "").toLowerCase().trim();
  return type === "upload" || type === "file-upload" || it.task.requires_review === true;
}
function fmtShortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return (iso.split("T")[0] ?? iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

/* ── Component ───────────────────────────────────────── */
export default function MiniChecklistWidget({
  saleId,
  role = "client",
  onlyStageKeys,
  showCompleteOnce = false,
  titleMeta,
}: Props) {
  const base = role === "admin" ? `/admin/sales/${saleId}` : `/${role}/sales/${saleId}`;

  const [data, setData] = React.useState<Summary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [basket, setBasket] = React.useState<File[]>([]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const completeKey = React.useMemo(() => `va:checklist:completeShown:${role}:${saleId}`, [role, saleId]);
  const [showCompleteBanner, setShowCompleteBanner] = React.useState(false);

  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const ensure = React.useCallback(async () => {
    const res = await fetch(`${base}/checklist/ensure`, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!res.ok && res.status !== 422) throw new Error(await res.text());
    return res.ok;
  }, [base]);

  const load = React.useCallback(async () => {
    const res = await fetch(`${base}/checklist`, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!res.ok) throw new Error(await res.text());
    setData(await res.json());
  }, [base]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const ok = await ensure();
        if (ok) {
          await load();
        } else {
          setData(null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load checklist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ensure, load]);

  const stagesOrdered = React.useMemo(() => {
    if (!data?.stages) return [] as Stage[];
    return [...data.stages].sort((a, b) => a.order - b.order);
  }, [data?.stages]);

  const itemsInOrder = React.useMemo(() => {
    if (!data?.items) return [] as Item[];
    const ordered: Item[] = [];
    for (const st of stagesOrdered) {
      for (const it of data.items) {
        if (!it.parent_item_id && it.task.stage.id === st.id) ordered.push(it);
      }
    }
    return ordered;
  }, [data?.items, stagesOrdered]);

  const stagesForBar = React.useMemo(() => {
    if (!data?.stages) return [] as Stage[];
    const list = onlyStageKeys?.length ? data.stages.filter(s => onlyStageKeys!.includes(s.key)) : data.stages;
    return [...list].sort((a, b) => a.order - b.order);
  }, [data?.stages, onlyStageKeys]);

  const localStageProgress = React.useMemo(() => {
    if (!data) return 0;
    const total = stagesForBar.length || 1;
    let done = 0;
    for (const st of stagesForBar) {
      const items = data.items.filter(i => i.task.stage.id === st.id && !i.parent_item_id);
      if (items.length && items.every(i => TERMINAL.has(toUiState(i.state)))) done++;
    }
    return Math.round((done / total) * 100);
  }, [data, stagesForBar]);

  const overallProgress = React.useMemo(() => {
    const p = typeof data?.progress === "number" ? (data!.progress as number) : null;
    if (p !== null && !Number.isNaN(p)) return Math.max(0, Math.min(100, Math.round(p)));
    return localStageProgress;
  }, [data?.progress, localStageProgress]);

  const isSaleComplete = React.useMemo(() => {
    if (!data) return false;
    if (typeof data.progress === "number")
      return Math.round(Math.max(0, Math.min(100, data.progress))) >= 100;
    return itemsInOrder.length > 0 && itemsInOrder.every(it => TERMINAL.has(toUiState(it.state)));
  }, [data, itemsInOrder]);

  React.useEffect(() => {
    if (role === "admin") return;
    if (!showCompleteOnce) return;
    if (!isSaleComplete) return;
    const already = localStorage.getItem(completeKey) === "1";
    if (!already) setShowCompleteBanner(true);
  }, [role, showCompleteOnce, isSaleComplete, completeKey]);

  /* ---- Header: prefer product name + date passed from parent ---- */
  const headerTitle = React.useMemo(() => {
    // If the shelf passed us data, prefer it.
    if (titleMeta?.productLabel || titleMeta?.date) {
      const label = titleMeta.productLabel?.toString().trim();
      const dateText = fmtShortDate(titleMeta.date ?? null);
      if (label) return `${label}${dateText ? ` — ${dateText}` : ""}`;
      if (dateText) return dateText;
    }

    // Otherwise, try what the checklist returned
    let fallback = "Sale Progress";
    if (role === "client" || role === "agent") {
      const sale = (data as any)?.sale as SaleMeta | undefined;
      const productLabel =
        (sale?.product_label ?? sale?.product_name ?? sale?.product ?? "")?.toString().trim() || null;
      const rawDate =
        sale?.contracted_at ??
        sale?.created_at ??
        (data as any)?.checklist_created_at ??
        (data as any)?.created_at ??
        null;
      const dateText = fmtShortDate(rawDate);
      if (productLabel) return `${productLabel}${dateText ? ` — ${dateText}` : ""}`;

      const saleNumber = sale?.number ?? sale?.id ?? saleId;
      return `Sale #${saleNumber}${dateText ? ` — ${dateText}` : ""}`;
    }
    return fallback;
  }, [titleMeta?.productLabel, titleMeta?.date, data, role, saleId]);

  /* ---- decide the primary callout ---- */
  type Primary =
    | { kind: "upload"; item: Item }
    | { kind: "waiting"; item: Item; message: string }
    | { kind: "gate"; message: string }
    | { kind: "next"; item: Item; message?: string }
    | { kind: "none" };

  const primary: Primary = React.useMemo(() => {
    if (!data) return { kind: "none" };
    const reviewing = itemsInOrder.find(it => toUiState(it.state) === "pending_review");
    if (reviewing) {
      return {
        kind: "waiting",
        item: reviewing,
        message: role === "client" ? "We’re reviewing your upload." : "Admin review in progress.",
      };
    }
    if (role === "client") {
      const rejected = itemsInOrder.find(it => isClientUpload(it) && toUiState(it.state) === "rejected");
      if (rejected) return { kind: "upload", item: rejected };
      const firstNonTerminalIdx = itemsInOrder.findIndex(it => !TERMINAL.has(toUiState(it.state)));
      if (firstNonTerminalIdx >= 0) {
        const candidate = itemsInOrder[firstNonTerminalIdx];
        const ui = toUiState(candidate.state);
        const canUploadState =
          ui === "todo" ||
          candidate.state === "not_started" ||
          candidate.state === "in_progress" ||
          candidate.state === "waiting_on_client";
        if (isClientUpload(candidate) && canUploadState) return { kind: "upload", item: candidate };
        return { kind: "gate", message: "No action required. We’re preparing your documents." };
      }
      return { kind: "none" };
    }
    if (role === "agent") {
      const waitingOnClient = itemsInOrder.find(
        it => isClientUpload(it) && (toUiState(it.state) === "todo" || it.state === "waiting_on_client")
      );
      if (waitingOnClient)
        return { kind: "waiting", item: waitingOnClient, message: `Waiting for client upload: ${waitingOnClient.task.label}` };
      const needsReupload = itemsInOrder.find(it => isClientUpload(it) && toUiState(it.state) === "rejected");
      if (needsReupload)
        return { kind: "waiting", item: needsReupload, message: `Client re‑upload required: ${needsReupload.task.label}` };
      const nextInternal = itemsInOrder.find(it => !TERMINAL.has(toUiState(it.state)));
      if (nextInternal) return { kind: "next", item: nextInternal, message: "Next step" };
      return { kind: "none" };
    }
    return { kind: "none" };
  }, [data, itemsInOrder, role]);

  /* ---- upload handling ---- */
  const triggerPicker = React.useCallback(() => fileRef.current?.click(), []);
  const onFilesPicked = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBasket(prev => [...prev, ...files]);
    if (fileRef.current) fileRef.current.value = "";
  }, []);
  const submitBasket = React.useCallback(async () => {
    if (primary.kind !== "upload" || basket.length === 0) return;
    const csrf = getCsrf();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };
    if (csrf) headers[csrf.header] = csrf.token;
    try {
      setBusy(true);
      const fd = new FormData();
      basket.forEach(f => {
        fd.append("files[]", f, f.name);
        fd.append("titles[]", f.name);
      });
      await fetch(`${base}/checklist/items/${primary.item.id}/upload`, {
        method: "POST",
        headers,
        credentials: "same-origin",
        body: fd,
      });
      setBasket([]);
      await load();
    } finally {
      setBusy(false);
    }
  }, [basket, base, load, primary]);

  /* ── Render ────────────────────────────────────────── */
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{headerTitle}</CardTitle></CardHeader>
        <CardContent><div className="text-sm text-muted-foreground">Loading…</div></CardContent>
      </Card>
    );
  }
  if (error || !data) {
    return (
      <Card>
        <CardHeader><CardTitle>{headerTitle}</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{error ?? "No checklist available for this sale yet."}</div>
        </CardContent>
      </Card>
    );
  }

  if ((role === "client" || role === "agent") && isSaleComplete) {
    if (showCompleteOnce && showCompleteBanner) {
      return (
        <Card>
          <CardHeader><CardTitle>{headerTitle}</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full rounded-lg border p-3 md:p-4 bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-600/40 dark:text-emerald-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>All set — this sale is complete.</span>
                </div>
                <Button size="sm" onClick={() => { localStorage.setItem(completeKey, "1"); setShowCompleteBanner(false); }}>
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  let latestRejectNote: string | undefined;
  if (primary.kind === "upload" && toUiState(primary.item.state) === "rejected") {
    for (let i = primary.item.links.length - 1; i >= 0; i--) {
      const l = primary.item.links[i];
      if (l.review_state === "rejected" && l.review_note) { latestRejectNote = l.review_note; break; }
    }
  }

  const calloutCls = {
    upload:
      "w-full rounded-lg border p-3 md:p-4 bg-blue-50/80 border-blue-200 text-blue-900 dark:bg-blue-900/40 dark:border-blue-500/40 dark:text-blue-50",
    wait:
      "w-full rounded-lg border p-3 md:p-4 bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-900/30 dark:border-amber-600/40 dark:text-amber-50",
    gate:
      "w-full rounded-lg border p-3 md:p-4 bg-muted/50 border-muted-foreground/20 text-muted-foreground dark:bg-zinc-900/40 dark:border-zinc-600/30 dark:text-zinc-200",
  };

  return (
    <Card aria-busy={busy}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{headerTitle}</CardTitle>
          <div className="w-48">
            <Progress value={overallProgress} className="dark:bg-white/20 dark:[&>div]:bg-white" />
            <div className="text-xs text-muted-foreground mt-1">{overallProgress}%</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex items-center justify-between">
        {primary.kind === "upload" && (
          <div className={calloutCls.upload} aria-live="polite">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-medium">Next step: {primary.item.task.label}</div>
                  {toUiState(primary.item.state) === "rejected" && (
                    <>
                      <div className="text-xs opacity-80">We need a new file for this step.</div>
                      {latestRejectNote && <div className="text-xs opacity-80 italic">“{latestRejectNote}”</div>}
                    </>
                  )}
                  <div className="text-xs opacity-75">
                    Add one or more documents, then click <strong>Submit</strong>. After you submit,
                    you won’t be able to add more unless we request changes.
                  </div>
                </div>
                <input type="file" multiple ref={fileRef} className="hidden" onChange={onFilesPicked} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </div>

              {basket.length > 0 && (
                <ul className="rounded border bg-white/70 dark:bg-zinc-900/40 divide-y">
                  {basket.map((f, i) => (
                    <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="truncate max-w-[22rem]" title={f.name}>{f.name}</span>
                      <button type="button" className="inline-flex items-center text-xs opacity-70 hover:opacity-100" onClick={() => setBasket(prev => prev.filter((_, idx) => idx !== i))} aria-label={`Remove ${f.name}`}>
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={triggerPicker} disabled={busy} variant="outline">
                  <UploadIcon className="h-4 w-4 mr-2" /> Add file(s)
                </Button>
                <Button onClick={() => setConfirmOpen(true)} disabled={busy || basket.length === 0}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        {primary.kind === "waiting" && (
          <div className={calloutCls.wait} aria-live="polite">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>{primary.message}</span>
            </div>
          </div>
        )}

        {primary.kind === "gate" && (
          <div className={calloutCls.gate} aria-live="polite">
            <div className="text-sm">{primary.message}</div>
          </div>
        )}

        {primary.kind === "next" && (
          <div className={calloutCls.wait} aria-live="polite">
            <div className="text-sm">
              {primary.message ?? "Next step"}: <span className="font-medium">{primary.item.task.label}</span>
            </div>
          </div>
        )}

        {primary.kind === "none" && (
          <div className="text-sm text-muted-foreground">No action required right now.</div>
        )}
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Submit document{basket.length > 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              You are about to submit {basket.length} file{basket.length > 1 ? "s" : ""} for review.
              After you submit, you won’t be able to upload more for this step unless we request changes.
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground">
            {basket.slice(0, 5).map((f, i) => (<div key={i} className="truncate">{f.name}</div>))}
            {basket.length > 5 && <div>+{basket.length - 5} more…</div>}
          </div>
          <DialogFooter className="gap-2">
            <Button onClick={() => { setConfirmOpen(false); submitBasket(); }}>Yes, submit</Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
