import * as React from "react";
import MiniChecklistWidget from "@/components/MiniChecklistWidget";
import { productLabel } from "@/lib/products"; // <-- your mapping

type SaleRow = {
  id: number;                     // sale_id
  product?: string | null;        // "revocable_trust", etc
  product_name?: string | null;   // optional server field
  product_label?: string | null;  // optional server field
  created_at?: string | null;
  contracted_at?: string | null;  // sale_date
  progress_cached?: number | null;
  status?: string | null;
};

type InertiaResp = {
  component: string;
  props: any;
  url: string;
  version?: string | null;
};

export default function SalesProgressShelf({
  role = "client",
  onlyStageKeys,
  showCompleteOnce = true,
  hideCompleted = true,
  limit,
  sourceUrl,          // optional explicit URL; if not given we’ll infer
}: {
  role?: "client" | "agent";
  onlyStageKeys?: string[];
  showCompleteOnce?: boolean;
  hideCompleted?: boolean;
  limit?: number;
  sourceUrl?: string;
}) {
  // Default to the index page for the role. For agents, this is /agent/sales (Inertia page).
  // We can read an Inertia JSON payload (component/props) and extract the list from props.sales.
  const base = sourceUrl ?? `/${role}/sales`;

  const [rows, setRows] = React.useState<SaleRow[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    function pickProductLabel(r: Partial<SaleRow>): string | null {
      // Prefer server-provided label/name, else map the raw product code.
      return (
        r.product_label ??
        r.product_name ??
        (r.product ? productLabel(r.product) : null) ??
        null
      );
    }

    async function fetchAll(url: string): Promise<SaleRow[]> {
      const acc: SaleRow[] = [];
      let next: string | null = url;

      while (next) {
        const res = await fetch(next, {
          headers: { Accept: "application/json" },
          credentials: "same-origin",
        });
        if (!res.ok) throw new Error(res.statusText);

        const json = (await res.json()) as unknown;

        // ── Case A: Inertia page payload from /agent/sales (component/props/…)
        if (json && typeof json === "object" && "component" in (json as any) && "props" in (json as any)) {
          const ir = json as InertiaResp;
          const sales = ir.props?.sales;
          const data = Array.isArray(sales?.data) ? sales.data : Array.isArray(sales) ? sales : [];
          for (const s of data) {
            acc.push({
              id: s.sale_id ?? s.id,
              product: s.product ?? null,
              created_at: s.created_at ?? null,
              contracted_at: s.sale_date ?? null,
              progress_cached: s?.checklistParent?.progress_cached ?? null,
              status: s.status ?? null,
              // derive a label later when rendering
            });
          }
          // Inertia paginator uses links; normalize “next”
          next =
            sales?.next_page_url ??
            sales?.links?.next ??
            null;
        }
        // ── Case B: Raw paginator { data: [...], next_page_url: ... }
        else if ((json as any)?.data && Array.isArray((json as any).data)) {
          const j: any = json;
          for (const s of j.data) {
            acc.push({
              id: s.sale_id ?? s.id,
              product: s.product ?? null,
              created_at: s.created_at ?? null,
              contracted_at: s.sale_date ?? null,
              progress_cached: s?.checklistParent?.progress_cached ?? null,
              status: s.status ?? null,
            });
          }
          next = j.next_page_url ?? j.links?.next ?? null;
        }
        // ── Case C: Plain array
        else if (Array.isArray(json)) {
          for (const s of json as any[]) {
            acc.push({
              id: s.sale_id ?? s.id,
              product: s.product ?? null,
              created_at: s.created_at ?? null,
              contracted_at: s.sale_date ?? null,
              progress_cached: s?.checklistParent?.progress_cached ?? null,
              status: s.status ?? null,
            });
          }
          next = null;
        } else {
          // Unknown shape; stop to avoid loops.
          next = null;
        }
      }

      // Newest first
      acc.sort((a, b) => {
        const ad = new Date(a.contracted_at ?? a.created_at ?? 0).getTime();
        const bd = new Date(b.contracted_at ?? b.created_at ?? 0).getTime();
        return bd - ad;
      });

      // Optional filters/slicing
      let out = acc;
      if (hideCompleted) {
        out = out.filter((r) => (r.progress_cached ?? -1) < 100);
      }
      if (typeof limit === "number") out = out.slice(0, limit);

      // Attach labels on the way out (so MiniChecklistWidget can display)
      return out.map((r) => ({
        ...r,
        product_label: pickProductLabel(r),
      }));
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await fetchAll(base);
        if (!cancelled) setRows(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load sales");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [base, hideCompleted, limit]);

  if (loading || error || !rows || rows.length === 0) return null;

  const labelOf = (r: SaleRow) =>
    r.product_label ?? r.product_name ?? (r.product ? productLabel(r.product) : null) ?? null;

  const dateOf = (r: SaleRow) => r.contracted_at ?? r.created_at ?? null;

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <MiniChecklistWidget
          key={row.id}
          saleId={row.id}
          role={role}
          onlyStageKeys={onlyStageKeys}
          showCompleteOnce={showCompleteOnce}
          titleMeta={{ productLabel: labelOf(row), date: dateOf(row) }}
        />
      ))}
    </div>
  );
}
