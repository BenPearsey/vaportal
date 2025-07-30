/* ------------------------------------------------------------------------- */
/* PeopleSelector.tsx                                                        */
/* ------------------------------------------------------------------------- */
import * as React from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandDialog
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X } from "lucide-react"
import axios from "@/bootstrap-axios"

/* ------------------------------------------------------------------ types */
export interface Person {
  id:    number
  type:  "user" | "contact"
  name:  string
  email: string | null
}

interface Props {
  value:    Person[]
  onChange: (v: Person[]) => void
}

/* ------------------------------------------------------------------------ */
export default function PeopleSelector({ value, onChange }: Props) {
  const [open,   setOpen]   = React.useState(false)
  const [query,  setQuery]  = React.useState("")
  const [items,  setItems]  = React.useState<Person[]>([])
  const [loading, setLoading] = React.useState(false)

  /* debounced search ----------------------------------------------------- */
  React.useEffect(() => {
    if (!open || query.trim() === "") {
      setItems([])
      return
    }

    const ctrl  = new AbortController()
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const { data } = await axios.get("/api/admin/people", {
          params: { q: query, limit: 20 },
          signal: ctrl.signal,
        })
        setItems(data as Person[])
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }, 250)

    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [open, query])

  /* helpers -------------------------------------------------------------- */
  const add    = (p: Person) =>
    !value.some(v => v.id === p.id && v.type === p.type) &&
    onChange([...value, p])

  const remove = (p: Person) =>
    onChange(value.filter(v => !(v.id === p.id && v.type === p.type)))

  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-2">
      {/* selected chips --------------------------------------------------- */}
      <div className="flex flex-wrap gap-1">
        {value.map(p => (
          <Badge key={`${p.type}-${p.id}`} variant="secondary" className="pr-1">
            {p.name}
            <X
              size={12}
              className="ml-1 cursor-pointer"
              onClick={() => remove(p)}
            />
          </Badge>
        ))}
      </div>

      {/* trigger ---------------------------------------------------------- */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <Plus className="h-4 w-4" />
        Add participant…
      </button>

      {/* search dialog ---------------------------------------------------- */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="overflow-hidden">
          <CommandInput
            placeholder="Search people…"
            value={query}
            onValueChange={setQuery}
            autoFocus
          />

          <ScrollArea className="h-56">
            <CommandList>
              {loading && (
                <CommandGroup heading="Loading…">
                  <CommandItem disabled>Searching…</CommandItem>
                </CommandGroup>
              )}

              {items.map(p => (
                <CommandItem
                  key={`${p.type}-${p.id}`}
                  value={p.name}
                  onSelect={() => {
                    add(p)
                    setQuery("")
                    setOpen(false)
                  }}
                >
                  <span className="mr-2">
                    {p.type === "user" ? "🧑" : "🤝"}
                  </span>
                  <div className="flex flex-col">
                    <span>{p.name}</span>
                    {p.email && (
                      <span className="text-xs text-muted-foreground">
                        {p.email}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}

              <CommandEmpty>No matches</CommandEmpty>
            </CommandList>
          </ScrollArea>
        </Command>
      </CommandDialog>
    </div>
  )
}
