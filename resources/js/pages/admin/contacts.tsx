/* eslint-disable react/jsx-no-constructed-context-values */
import { useState } from "react";
import AppLayout from "@/layouts/app-layout-admin";
import { Head, Link, router, usePage } from "@inertiajs/react";
import dayjs from "dayjs";

/* shadcn/ui */
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/* icons */
import {
  Filter, MoreHorizontal, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Trash2, Eye,
} from "lucide-react";
import { toast } from "sonner";

/* types */
import type { BreadcrumbItem } from "@/types";
import type { Contact }        from "@/types/contact";

/* ── breadcrumbs ── */
const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home",     href: "/admin/dashboard" },
  { title: "Contacts", href: "/admin/contacts" },
];

/* role-badge colours */
const badgeCls: Record<string, string> = {
  Admin : "bg-amber-600 text-white",
  Agent : "bg-sky-600 text-white",
  Client: "bg-emerald-600 text-white",
  User  : "bg-violet-600 text-white",
  Standalone: "bg-gray-500 text-white",
};

/* filters & sorting */
type RoleFilter = "All" | "Standalone" | "Admin" | "Agent" | "Client" | "User";

const sortLabels = {
  name   : "Name",
  email  : "Email",
  company: "Company",
  phone  : "Phone",
  created: "Created",
} as const;
type SortKey = keyof typeof sortLabels;

/* ─────────────────────────────────────────────── */
export default function AdminContactsPage() {
  const { contacts: pageData, sortCol, sortDir } = usePage().props as any;
  const contacts: Contact[] = pageData.data ?? [];

  const [query,   setQuery]   = useState("");
  const [roleSel, setRoleSel] = useState<RoleFilter>("All");
  const [trashId, setTrashId] = useState<number | null>(null);

  /* search + role filter (client-side) */
  const list = contacts.filter(c => {
    const q = query.toLowerCase();
    const hit =
      `${c.firstname} ${c.lastname}`.toLowerCase().includes(q) ||
      (c.email   ?? "").toLowerCase().includes(q) ||
      (c.phone   ?? "").toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q);

    const role =
      c.admin_id  ? "Admin"  :
      c.agent_id  ? "Agent"  :
      c.client_id ? "Client" :
      c.user_id   ? "User"   : "Standalone";

    return hit && (roleSel === "All" || roleSel === role);
  });

  /* helpers */
  const changeSort = (col: SortKey) => {
    const dir = col === sortCol ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    router.visit(`/admin/contacts?sort=${col}&dir=${dir}`);
  };
  const goto = (p: number) =>
    router.visit(`/admin/contacts?page=${p}&sort=${sortCol}&dir=${sortDir}`);

  const reallyDelete = () => {
    if (!trashId) return;
    router.delete(route("admin.contacts.destroy", trashId), {}, {
      onSuccess: () => { toast.success("Contact deleted"); router.reload({ only:["contacts"] }); },
      onError  : () => toast.error("Delete failed"),
    });
    setTrashId(null);
  };

  /* ── render ── */
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Contacts" />

      <div className="flex flex-col gap-6 p-6">
        {/* search / filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            placeholder="Search name, email, phone, company"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full md:w-1/3"
          />

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" /> {roleSel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["All","Standalone","Admin","Agent","Client","User"].map(r => (
                  <DropdownMenuItem key={r} onClick={() => setRoleSel(r as RoleFilter)}>
                    {r}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href={route("admin.contacts.create")}>
              <Button>Add Contact</Button>
            </Link>
          </div>
        </div>

        {/* grid */}
        <Card>
          <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {(["name","email","company","phone","created"] as SortKey[]).map(col => (
                    <TableHead
                      key={col}
                      onClick={() => changeSort(col)}
                      className="cursor-pointer select-none whitespace-nowrap"
                    >
                      {sortLabels[col]}
                      {sortCol === col && (
                        sortDir === "asc"
                          ? <ChevronUp className="inline h-4 w-4 ml-1" />
                          : <ChevronDown className="inline h-4 w-4 ml-1" />
                      )}
                    </TableHead>
                  ))}
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {list.map(c => {
                  const role =
                    c.admin_id  ? "Admin"  :
                    c.agent_id  ? "Agent"  :
                    c.client_id ? "Client" :
                    c.user_id   ? "User"   : "Standalone";

                  return (
                    <TableRow key={c.id}>
                      <TableCell>{c.firstname} {c.lastname}</TableCell>
                      <TableCell>{c.email   || "—"}</TableCell>
                      <TableCell>{c.company || "—"}</TableCell>
                      <TableCell>{c.phone   || "—"}</TableCell>
                      <TableCell>{c.created_at ? dayjs(c.created_at).format("MMM D YYYY") : "—"}</TableCell>
                      <TableCell>
                        <Badge className={badgeCls[role]}>{role === "Standalone" ? "—" : role}</Badge>
                      </TableCell>

                      {/* actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={route("admin.contacts.show", c.id)}>
                                <Eye className="h-4 w-4 mr-2" /> View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setTrashId(c.id)}
                              className="text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* pagination */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Page {pageData.current_page} of {pageData.last_page}
              </span>
              <div className="flex gap-2">
                <Button
                  size="icon" variant="outline"
                  disabled={pageData.current_page === 1}
                  onClick={() => goto(pageData.current_page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon" variant="outline"
                  disabled={pageData.current_page === pageData.last_page}
                  onClick={() => goto(pageData.current_page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* delete confirm */}
      <Dialog open={trashId !== null} onOpenChange={() => setTrashId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete contact?</DialogTitle></DialogHeader>
          <p className="py-2 text-sm">This can’t be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTrashId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={reallyDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
