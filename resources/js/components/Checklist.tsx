// resources/js/components/Checklist.tsx
import { useState, useEffect } from "react";
import axios        from "axios";
import { Checkbox } from "@/components/ui/checkbox";

interface Item  { label: string; done: boolean }
interface Props {
  entityId:    number;      // agent_id or sale_id
  checklist:   Item[];
  updateRoute: string;      // "admin.agents.checklist" or "admin.sales.checklist"
}

export default function Checklist({ entityId, checklist, updateRoute }: Props) {
  const [items,  setItems]  = useState<Item[]>(checklist ?? []);
  const [saving, setSaving] = useState(false);           // optional “saving…” hint

  /* if parent sends fresh data, keep UI in sync */
  useEffect(() => setItems(checklist ?? []), [checklist]);

  async function toggle(idx: number) {
    const optimistic = [...items];
    optimistic[idx].done = !optimistic[idx].done;
    setItems(optimistic);                   // ⬅️ instant UI feedback
    setSaving(true);

    try {
      await axios.put(
        route(updateRoute, entityId),       // works for routes like /agents/{agent}
        { index: idx, done: optimistic[idx].done }
      );
    } catch (e) {
      // ❌ revert if the request fails
      const reverted = [...items];
      reverted[idx].done = !reverted[idx].done;
      setItems(reverted);
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <Checkbox checked={it.done} onCheckedChange={() => toggle(i)} />
            <span className={it.done ? "line-through text-gray-400" : ""}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>

      {saving && (
        <p className="text-xs text-gray-400 mt-1 select-none">saving…</p>
      )}
    </>
  );
}
