/* ContactHub – overview, activities, documents & quick-notes CRUD
   plus dedicated Agent / Client sub-tabs
   ---------------------------------------------------------------- */

import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

/* ui ---------------------------------------------------------------- */
import AppLayout from '@/layouts/app-layout-admin'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table, TableHead, TableHeader, TableRow, TableCell, TableBody,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Badge }    from '@/components/ui/badge'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  MoreHorizontal, Pencil, Trash2, ChevronLeft, PenLine,
} from 'lucide-react'
import { toast } from 'sonner'

import EventViewer         from '@/components/EventViewer'
import ContactFileExplorer from '@/components/ContactFileExplorer'
import AgentTab            from '@/components/contact-hub/AgentTab'
import ClientTab           from '@/components/contact-hub/ClientTab'
import type { BreadcrumbItem } from '@/types'

/* helpers ------------------------------------------------------------ */
const badgeCls: Record<string,string> = {
  Admin :'bg-amber-600 text-white',
  Agent :'bg-sky-600 text-white',
  Client:'bg-emerald-600 text-white',
  User  :'bg-violet-600 text-white',
}
const roleBadges = (r:string[]) =>
  r.length
    ? r.map(s => (
        <Badge key={s} className={badgeCls[s] ?? 'bg-gray-500 text-white'}>
          {s}
        </Badge>
      ))
    : <Badge className="bg-gray-500 text-white">—</Badge>

const Col = ({ label, value }:{label:string; value?:string|null}) => (
  <p className="text-sm">
    <span className="mr-1 font-medium text-muted-foreground">{label}:</span>
    {value?.toString().trim() || '—'}
  </p>
)

/* component ---------------------------------------------------------- */
export default function ContactHub() {
  const {
    contact,
    folders   = [],
    documents = [],
    events    = [],
    histories = [],
    links     = [],
    client: clientBundle = null,
    agent : agentBundle  = null,
  } = usePage().props as any

  /* local state */
  const [viewEvent, setViewEvent] = useState<any|null>(null)
  const [newNote,   setNewNote]   = useState('')
  const [editId,    setEditId]    = useState<number|null>(null)
  const [editText,  setEditText]  = useState('')

  /* endpoints */
  const docsBase  = `/admin/contacts/${contact.id}/documents`
  const notesBase = `/admin/contacts/${contact.id}/history`

  /* breadcrumbs */
  const crumbs: BreadcrumbItem[] = [
    { title:'Home',     href:'/admin/dashboard' },
    { title:'Contacts', href:'/admin/contacts' },
    { title:`${contact.firstname} ${contact.lastname}`, href:'#' },
  ]

  /* ---------- note actions ---------- */
  const addNote = () => {
    if (!newNote.trim()) return
    router.post(
      route('admin.contacts.history.store', { contact: contact.id }),
      { note: newNote },
      { onSuccess: () => {
          toast.success('Note added')
          setNewNote('')
          router.reload({ only:['histories'] })
        }
      }
    )
  }

  const startEdit = (h:any) => { setEditId(h.id); setEditText(h.details) }
  const saveEdit  = () => {
    if (editId === null) return
    router.put(`${notesBase}/${editId}`, { details:editText }, {
      onSuccess: () => {
        toast.success('Note updated')
        setEditId(null); setEditText('')
        router.reload({ only:['histories'] })
      },
    })
  }
  const deleteNote = (id:number) =>
    router.delete(`${notesBase}/${id}`, {
      onSuccess: () => {
        toast.success('Note deleted')
        router.reload({ only:['histories'] })
      },
    })

  /* ------------------------------------------------------------------ */
  return (
    <AppLayout breadcrumbs={crumbs}>
      <Head title={`Contact – ${contact.firstname} ${contact.lastname}`} />

      {/* ───── Header card (never resizes) ───── */}
      <Card className="mx-auto mt-4 max-w-5xl">
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              {contact.firstname} {contact.lastname}
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {roleBadges(contact.roles)}
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
                <Link href={`/admin/contacts-edit/${contact.id}`}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Link>
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50"
                onClick={() =>
                  router.delete(`/admin/contacts/${contact.id}`, {},
                    () => router.visit('/admin/contacts'))
                }>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </Card>

      {/* ───── Full-width tab set ───── */}
      <Tabs defaultValue="overview" className="mt-6 space-y-6">
        <TabsList className="sticky top-0 z-10 bg-background/90 backdrop-blur">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          {clientBundle && <TabsTrigger value="client">Client</TabsTrigger>}
          {agentBundle  && <TabsTrigger value="agent">Agent</TabsTrigger>}
        </TabsList>

        {/* ---------- OVERVIEW ---------- */}
        <TabsContent value="overview">
          <section className="min-h-[60vh] mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Col label="Prefix"  value={contact.prefix} />
              <Col label="Middle"  value={contact.middle} />
              <Col label="Phone"   value={contact.phone} />
              <Col label="Email"   value={contact.email} />
              <Col label="Company" value={contact.company} />
              <Col
                label="Address"
                value={`${contact.address ?? ''} ${contact.city ?? ''} ${contact.zipcode ?? ''}`}
              />
              <Col
                label="Created"
                value={dayjs(contact.created_at).format('MMM D YYYY')}
              />
              <Col
                label="Updated"
                value={dayjs(contact.updated_at).fromNow()}
              />
              <Col label="Creator" value={contact.creator?.email} />

              {/* linked contacts */}
              {links.length > 0 && (
                <>
                  <Separator className="my-4 col-span-full" />
                  <h4 className="text-sm font-semibold col-span-full">
                    Linked contacts
                  </h4>
                  <ul className="space-y-1 col-span-full">
                    {links.map((ln:any) => {
                      const other = ln.contact_id === contact.id
                        ? ln.related : ln.contact
                      return (
                        <li
                          key={ln.id}
                          className="flex items-center justify-between">
                          <Link
                            className="text-primary hover:underline"
                            href={`/admin/contacts/${other.id}/hub`}>
                            {other.firstname} {other.lastname}
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              router.delete(
                                `/admin/contacts/${contact.id}/links/${ln.id}`,
                                { onSuccess: () =>
                                    router.reload({ only:['links'] }) }
                              )
                            }>
                            Unlink
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </div>
          </section>
        </TabsContent>

        {/* ---------- ACTIVITIES ---------- */}
        <TabsContent value="activities">
          <section className="min-h-[60vh] mx-auto max-w-5xl">
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
                  {events.map((e:any) => (
                    <TableRow
                      key={e.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setViewEvent(e)}>
                      <TableCell>
                        {dayjs(e.start_datetime).format('MMM D YYYY h:mm A')}
                      </TableCell>
                      <TableCell>{e.activity_type}</TableCell>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{e.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No activities.</p>
            )}
          </section>
        </TabsContent>

        {/* ---------- DOCUMENTS ---------- */}
        <TabsContent value="documents">
          <section className="min-h-[60vh] mx-auto max-w-5xl">
            <ContactFileExplorer
              contactId={contact.id}
              folders={folders}
              documents={documents}
              /* ---------- document actions ---------- */
              onFileUpload={(file,fid,title) => {
                const fd = new FormData()
                fd.append('file', file)
                if (fid !== null)
                  fd.append('folder_id', fid.toString())
                fd.append('title', title)
                router.post(docsBase, fd, {
                  onSuccess: () => {
                    toast.success('Uploaded')
                    router.reload({ only:['documents'] })
                  },
                })
              }}
              onDeleteDocument={id =>
                router.delete(`${docsBase}/${id}`, {
                  onSuccess: () => {
                    toast.success('Deleted')
                    router.reload({ only:['documents'] })
                  },
                })}
              onMoveDocument={(id,fid) =>
                router.post(`${docsBase}/${id}/move`, { folder_id:fid }, {
                  onSuccess: () => {
                    toast.success('Moved')
                    router.reload({ only:['documents'] })
                  },
                })}
              onRenameDocument={(id,t) =>
                router.post(`${docsBase}/${id}/rename`, { title:t }, {
                  onSuccess: () => {
                    toast.success('Renamed')
                    router.reload({ only:['documents'] })
                  },
                })}
              /* ---------- folder actions ---------- */
              onCreateFolder={(name,pid) =>
                router.post(`${docsBase}/folders`, { name, parent_id:pid }, {
                  onSuccess: () => {
                    toast.success('Folder created')
                    router.reload({ only:['folders'] })
                  },
                })}
              onRenameFolder={(fid,name) =>
                router.post(`${docsBase}/folders/${fid}/rename`, { name }, {
                  onSuccess: () => {
                    toast.success('Folder renamed')
                    router.reload({ only:['folders'] })
                  },
                })}
              onMoveFolder={(fid,pid) =>
                router.post(`${docsBase}/folders/${fid}/move`, { parent_id:pid }, {
                  onSuccess: () => {
                    toast.success('Folder moved')
                    router.reload({ only:['folders'] })
                  },
                })}
              onDeleteFolder={fid =>
                router.delete(`${docsBase}/folders/${fid}`, {
                  onSuccess: () => {
                    toast.success('Folder deleted')
                    router.reload({ only:['folders','documents'] })
                  },
                })}
            />
          </section>
        </TabsContent>

        {/* ---------- NOTES ---------- */}
        <TabsContent value="notes">
          <section className="min-h-[60vh] mx-auto max-w-5xl space-y-4">
            {histories.length ? histories.map((h:any) => (
              <Card key={h.id}>
                <CardHeader className="flex items-start justify-between py-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{h.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {dayjs(h.created_at).fromNow()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(h)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteNote(h.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>

                {editId === h.id ? (
                  <CardContent className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={!editText.trim()}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditId(null); setEditText('') }}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="text-sm whitespace-pre-wrap">
                    {h.details}
                  </CardContent>
                )}
              </Card>
            )) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}

            {/* add note */}
            <div className="flex gap-2">
              <Input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Quick note…"
              />
              <Button onClick={addNote} disabled={!newNote.trim()}>
                Add
              </Button>
            </div>
          </section>
        </TabsContent>

        {/* ---------- CLIENT TAB ---------- */}
        {clientBundle && (
          <TabsContent value="client">
            <section className="min-h-[60vh]">
              <ClientTab {...clientBundle} />
            </section>
          </TabsContent>
        )}

        {/* ---------- AGENT TAB ---------- */}
        {agentBundle && (
          <TabsContent value="agent">
            <section className="min-h-[60vh]">
              <AgentTab {...agentBundle} />
            </section>
          </TabsContent>
        )}

      </Tabs>

      {/* back button */}
      <div className="max-w-5xl mx-auto mt-4">
        <Button
          variant="secondary"
          onClick={() => router.visit('/admin/contacts')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
      </div>

      {/* event viewer */}
      <Dialog open={!!viewEvent} onOpenChange={() => setViewEvent(null)}>
        <DialogContent className="max-w-2xl">
          {viewEvent && <EventViewer event={viewEvent} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
