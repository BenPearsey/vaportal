/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState } from "react";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import EventViewer from "@/components/EventViewer";  


/* UI bits */
import AppLayout from "@/layouts/app-layout-admin";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge }       from "@/components/ui/badge";
import { Button }      from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea }  from "@/components/ui/textarea";

/* extra components ---------------------------------------------- */
import PeopleSelector, { Person } from "@/components/PeopleSelector";
import { X, ChevronLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

/* helpers ---------------------------------------------------------------- */
const badgeCls: Record<string, string> = {
  Admin : "bg-amber-600 text-white",
  Agent : "bg-sky-600 text-white",
  Client: "bg-emerald-600 text-white",
  User  : "bg-violet-600 text-white",
};

function roleBadges(c: any) {
  const roles: string[] = [];
  if (c.admin_id)  roles.push("Admin");
  if (c.agent_id)  roles.push("Agent");
  if (c.client_id) roles.push("Client");
  if (c.user_id)   roles.push("User");
  if (!roles.length) roles.push("Standalone");
  return roles;
}

/* ------------------------------------------------------------------------ */
export default function ShowContact() {
  const { contact: raw } = usePage().props as any;

  const contact   = raw;
  const events    = contact.events    ?? [];
  const histories = contact.histories ?? [];
  const linksRaw  = contact.links     ?? [];

  /* l.other = the opposite side of the link */
  const links = linksRaw.map((l: any) => ({
    id:       l.id,
    relation: l.relation,
    other:    l.related_contact_id === contact.id ? l.contact : l.related,
  }));

  /* UI state */
  const [trashOpen, setTrashOpen] = useState(false);
  const [noteOpen,  setNoteOpen]  = useState(false);
  const [linkOpen,  setLinkOpen]  = useState(false);
  const [note,      setNote]      = useState("");
  const [viewEvent, setViewEvent] = useState<any | null>(null);


  /* PeopleSelector state — an **array** as the component expects */
  const [selected,  setSelected]  = useState<Person[]>([]);
  const [relation,  setRelation]  = useState("Spouse");

  const { reset } = useForm();  // just for clearing errors on success

  /* -------------------------------------------------------------------- */
  const submitNote = () => {
    router.post(route("admin.contacts.history.store", contact.id), { note }, {
      onSuccess: () => {
        toast.success("Note added");
        setNote(""); setNoteOpen(false);
        router.reload({ only:["contact"] });
      },
      onError: () => toast.error("Save failed"),
    });
  };

  const addLink = () => {
    const pick = selected.at(0);          // we only care about the first pick
    if (!pick) return;

    router.post(route("admin.contacts.links.store", contact.id), {
      related_contact_id: pick.id,
      relation,
    },{
      onSuccess: () => {
        toast.success("Contact linked");
        setSelected([]); setRelation("Spouse"); setLinkOpen(false); reset();
        router.reload({ only:["contact"] });
      },
      onError: () => toast.error("Add link failed"),
    });
  };

  const deleteLink = (linkId: number) => {
    router.delete(route("admin.contacts.links.destroy", [contact.id, linkId]), {}, {
      onSuccess: () => router.reload({ only:["contact"] }),
    });
  };

  /* breadcrumbs */
  const crumbs: BreadcrumbItem[] = [
    { title: "Home",     href: "/admin/dashboard" },
    { title: "Contacts", href: "/admin/contacts" },
    { title: `${contact.firstname} ${contact.lastname}`, href: "#" },
  ];

  /* -------------------------------------------------------------------- */
  return (
    <AppLayout breadcrumbs={crumbs}>
      <Head title="Contact details" />

      <div className="mx-auto mt-4 max-w-5xl space-y-6">
        <Card>
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {contact.firstname} {contact.lastname}
              </CardTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {roleBadges(contact).map(r => (
                  <Badge key={r} className={badgeCls[r] ?? "bg-gray-500 text-white"}>
                    {r === "Standalone" ? "—" : r}
                  </Badge>
                ))}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={route("admin.contacts.edit", contact.id)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Link>
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50"
                  onClick={() => setTrashOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          {/* TABS -------------------------------------------------------- */}
          <Tabs defaultValue="details" className="px-6 pb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* DETAILS -------------------------------------------------- */}
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Column label="Prefix"  value={contact.prefix} />
                <Column label="Middle"  value={contact.middle} />
                <Column label="Phone"   value={contact.phone} />
                <Column label="Email"   value={contact.email} />
                <Column label="Company" value={contact.company} />
                <Column
                  label="Address"
                  value={`${contact.address ?? ""} ${contact.city ?? ""} ${contact.zipcode ?? ""}`}
                />
                <Column label="Created" value={dayjs(contact.created_at).format("MMM D YYYY")} />
                <Column label="Updated" value={dayjs(contact.updated_at).fromNow()} />
                <Column label="Creator" value={contact.creator?.email} />
              </div>

              {/* Linked contacts */}
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Linked contacts
                </h4>
                <Button size="sm" onClick={() => setLinkOpen(true)}>
                  + Link contact
                </Button>
              </div>

              {links.length ? (
                <ul className="mt-2 space-y-1">
                  {links.map((l: any) => (
                    <li key={l.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={route("admin.contacts.show", l.other.id)}
                        className="text-sm underline"
                      >
                        {l.other.firstname} {l.other.lastname}
                      </Link>
                      <span className="text-xs text-muted-foreground">{l.relation}</span>
                      <Button size="icon" variant="ghost" onClick={() => deleteLink(l.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">No linked contacts.</p>
              )}

              {contact.notes && (
                <>
                  <Separator className="my-6" />
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{contact.notes}</p>
                </>
              )}
            </TabsContent>

            {/* ACTIVITIES --------------------------------------------- */}
           <TabsContent value="activities">
  {events.length ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {events.map((ev: any) => (
          <TableRow
            key={ev.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => setViewEvent(ev)}          // ▸ open modal
          >
            <TableCell>{dayjs(ev.start_datetime).format("MMM D YYYY h:mm A")}</TableCell>
            <TableCell>{ev.activity_type}</TableCell>
            <TableCell>{ev.title}</TableCell>
            <TableCell>{ev.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <p className="text-sm text-muted-foreground">No activities.</p>
  )}
</TabsContent>


            {/* HISTORY ------------------------------------------------ */}
            <TabsContent value="history">
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setNoteOpen(true)}>+ Quick note</Button>
              </div>

              {histories.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {histories.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell>{dayjs(h.created_at).format("MMM D YYYY h:mm A")}</TableCell>
                        <TableCell>{h.type}</TableCell>
                        <TableCell className="whitespace-pre-line">{h.details}</TableCell>
                        <TableCell>{h.creator?.email ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No history yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <Button variant="secondary" onClick={() => router.visit("/admin/contacts")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
      </div>

      {/* Quick-note modal */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add quick note</DialogTitle></DialogHeader>
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Type your note…"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button disabled={!note.trim()} onClick={submitNote}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link-contact modal */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Link a contact</DialogTitle></DialogHeader>

          <PeopleSelector
            value={selected}
            onChange={setSelected}
          />

          <div className="mt-4">
            <label className="block mb-1 text-sm font-medium">Relation</label>
            <select
              className="w-full rounded-md border p-2 text-sm"
              value={relation}
              onChange={e => setRelation(e.target.value)}
            >
              {["Spouse","Child","Parent","Sibling","Coworker","Business Partner","Other"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setLinkOpen(false)}>Cancel</Button>
            <Button disabled={!selected.length} onClick={addLink}>Link</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Event viewer modal */}
<Dialog open={!!viewEvent} onOpenChange={() => setViewEvent(null)}>
  <DialogContent className="max-w-2xl">
    {viewEvent && <EventViewer event={viewEvent} />}
  </DialogContent>
</Dialog>


      {/* Delete confirm */}
      <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this contact?</DialogTitle></DialogHeader>
          <p className="py-2 text-sm">This can’t be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTrashOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() =>
                router.delete(route("admin.contacts.destroy", contact.id), {}, () =>
                  router.visit("/admin/contacts")
                )
              }
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

/* small helper */
function Column({ label, value }: { label: string; value?: string | null }) {
  return (
    <p className="text-sm">
      <span className="mr-1 font-medium text-muted-foreground">{label}:</span>
      {value?.toString().trim() || "—"}
    </p>
  );
}
