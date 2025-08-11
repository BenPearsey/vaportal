/* ------------------------------------------------------------------------- */
/* PeopleSelector.tsx                                                        */
/* ------------------------------------------------------------------------- */
import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, PlusCircle, X, Mail } from "lucide-react";
import axios from "@/bootstrap-axios";

/* ─────────────────────────── types ─────────────────────────── */
export type Person =
  | { id: number; type: "user" | "contact"; name: string; email: string | null }
  | { id: 0; type: "email"; name: string; email: string };

interface Props {
  value: Person[];
  onChange: (v: Person[]) => void;
}

/* ───────────────────────── component ───────────────────────── */
export default function PeopleSelector({ value, onChange }: Props) {
  const [open,   setOpen]   = React.useState(false);
  const [query,  setQuery]  = React.useState("");
  const [items,  setItems]  = React.useState<Person[]>([]);
  const [loading,setLoading]= React.useState(false);

  /* ---------- helpers ---------- */
  const add = (p: Person) => {
    if (!value.some(v => v.email === p.email)) onChange([...value, p]);
    setQuery(""); setOpen(false);
  };
  const remove = (p: Person) =>
    onChange(value.filter(v => v.email !== p.email));

  /* ---------- fetch people ---------- */
  React.useEffect(() => {
    if (!open || query.trim() === "") { setItems([]); return; }

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/admin/people", {
          params: { q: query, limit: 20 }, signal: ctrl.signal,
        });
        const res: Person[] = data;
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query) &&
            !res.some(r => r.email === query)) {
          res.push({ id:0, type:"email", name:query, email:query });
        }
        setItems(res);
      } finally { setLoading(false); }
    }, 250);

    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [open, query]);

  /* --------------------------- UI --------------------------- */
  return (
    <div className="space-y-2">
      {/* chips */}
      <div className="flex flex-wrap gap-1">
        {value.map(p => (
          <Badge
            key={p.email}
            variant={p.type === "email" ? "destructive" : "secondary"}
            className="pr-1"
          >
            {p.type === "email" && <Mail size={12} className="mr-1" />}
            {p.name}
            <X size={12} className="ml-1 cursor-pointer" onClick={() => remove(p)} />
          </Badge>
        ))}
      </div>

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus className="h-4 w-4" /> Add participant…
      </button>

      {/* dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="overflow-hidden">
          <CommandInput
            placeholder="Search people or enter e-mail…"
            value={query}
            onValueChange={setQuery}
            autoFocus
            onKeyDown={e => {
              if (e.key === "Enter" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) {
                add({ id:0, type:"email", name:query, email:query });
              }
            }}
          />

          <ScrollArea className="h-56">
            <CommandList>
              {loading && (
                <CommandGroup heading="Loading…">
                  <CommandItem disabled>Searching…</CommandItem>
                </CommandGroup>
              )}

              {/* plus-invite row */}
              {query &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query) &&
                !items.some(i => i.email === query) && (
                  <CommandItem
                    value={query}
                    onSelect={() => add({ id:0, type:"email", name:query, email:query })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4 text-primary" />
                    Invite <span className="font-medium">{query}</span>
                  </CommandItem>
                )}

              {/* list */}
              {items.map(p =>
                p.type === "email" ? (
                  <FreeEmailOption key={p.email} person={p} onPick={add} />
                ) : (
                  <CommandItem
                    key={`${p.type}-${p.id}`}
                    value={p.name}
                    onSelect={() => add(p)}
                  >
                    <span className="mr-2">{p.type === "user" ? "🧑" : "🤝"}</span>
                    <div className="flex flex-col">
                      <span>{p.name}</span>
                      {p.email && <span className="text-xs text-muted-foreground">{p.email}</span>}
                    </div>
                  </CommandItem>
                )
              )}

              <CommandEmpty>No matches</CommandEmpty>
            </CommandList>
          </ScrollArea>
        </Command>
      </CommandDialog>
    </div>
  );
}

/* ---------- free-typed e-mail option ---------- */
function FreeEmailOption({
  person, onPick,
}: { person: Person; onPick: (p: Person) => void }) {
  const [creating, setCreating] = React.useState(false);

  const addAsContact = async () => {
    try {
      setCreating(true);
      const { data } = await axios.post("/api/admin/contacts", {
        firstname:null, lastname:null, email:person.email,
      });
      onPick({
        id:data.id, type:"contact",
        name:(data.firstname||data.lastname)
          ? `${data.firstname ?? ""} ${data.lastname ?? ""}`.trim()
          : data.email,
        email:data.email,
      });
    } finally { setCreating(false); }
  };

  return (
    <CommandItem disabled={creating}>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          <Mail size={14} /> <span className="truncate">{person.email}</span>
        </div>
        <div className="flex gap-2 text-xs pt-1">
          <button type="button" className="underline text-primary" onClick={() => onPick(person)}>
            Invite only
          </button>
          <button type="button" className="underline" onClick={addAsContact} disabled={creating}>
            {creating ? "Adding…" : "Add as contact"}
          </button>
        </div>
      </div>
    </CommandItem>
  );
}
