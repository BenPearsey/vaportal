/* Client-specific tab for the Contact Hub
   -------------------------------------- */
import { router, Link } from '@inertiajs/react'
import dayjs            from 'dayjs'
import { useState }     from 'react'
import { toast }        from 'sonner'

import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 }   from 'lucide-react'

import FileExplorer, { Folder, Doc as ClientDocument } from '@/components/FileExplorer'

/* ------------------------------------------------------------------ */
interface ClientNote { id:number; content:string; created_at:string; created_by:string }

interface Props {
  core : any               // client record (agent + banking)
  docs : ClientDocument[]
  dirs : Folder[]
  notes: ClientNote[]
}

/* helpers */
const mask = (num?:string|null, nVisible=4)=>
  num ? '•••• ' + num.slice(-nVisible) : 'N/A'

/* ------------------------------------------------------------------ */
export default function ClientTab ({ core, docs, dirs, notes }: Props) {

  const base = `/admin/clients/${core.client_id}`
  const ok   = (msg:string)=>()=> toast.success(msg)

  /* local state */
  const [newNote ,setNewNote ] = useState('')
  const [delId   ,setDelId   ] = useState<number|null>(null)
  const [showFullBank, setShowFullBank] = useState(false)

  /* derive agent-contact id if available */
  const agentContactId =
    core.agent?.contact_id
    ?? core.agent?.contact?.id
    ?? undefined

  /* ================================================================ */
  return (
    <div className="space-y-6">

      {/* ───── profile & banking ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* profile */}
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <p><strong>Email:</strong>  {core.email}</p>
            <p><strong>Phone:</strong>  {core.phone ?? '—'}</p>
            <p><strong>Status:</strong> {core.status}</p>

            {core.agent && agentContactId && (
              <p>
                <strong>Agent:</strong>{' '}
                <Link
                  href={`/admin/contacts/${agentContactId}/hub`}
                  className="text-blue-600 hover:underline"
                >
                  {core.agent.firstname} {core.agent.lastname}
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* banking */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Banking Details</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={()=> setShowFullBank(!showFullBank)}
            >
              {showFullBank ? 'Hide numbers' : 'Show full numbers'}
            </Button>
          </CardHeader>

          <CardContent className="grid gap-1 text-sm">
            <p><strong>Bank:</strong> {core.bank_name      ?? 'N/A'}</p>
            <p><strong>Account&nbsp;Type:</strong> {core.account_type   ?? 'N/A'}</p>
            <p><strong>Account&nbsp;Holder:</strong> {core.account_holder ?? 'N/A'}</p>
            <p><strong>Routing&nbsp;#:</strong> {showFullBank
              ? (core.routing_number ?? 'N/A')
              : mask(core.routing_number)}</p>
            <p><strong>Account&nbsp;#:</strong> {showFullBank
              ? (core.account_number ?? 'N/A')
              : mask(core.account_number)}</p>
          </CardContent>
        </Card>

      </div>

      {/* ───── Tabs ───── */}
      <Tabs defaultValue="docs">
        <TabsList className="mb-4">
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* ---------- Documents ---------- */}
        <TabsContent value="docs">
          <FileExplorer
            folders   ={dirs}
            documents ={docs}
            viewRoute={id=>route('admin.clients.documents.view',
                                 {client:core.client_id, document:id})}

            /* CRUD handlers … unchanged … */
            onFileUpload={(file,fid,title)=>{
              const fd=new FormData()
              fd.append('file',file)
              fd.append('folder_id',fid.toString())
              fd.append('title',title)
              router.post(`${base}/documents/upload`,fd,{ onSuccess:ok('Uploaded') })
            }}
            onDeleteDocument={id=> router.delete(
              `${base}/documents/${id}`,{ onSuccess:ok('Deleted') })}
            onMoveDocument={(id,fid)=> router.post(
              `${base}/documents/${id}/move`,{folder_id:fid},{ onSuccess:ok('Moved') })}
            onRenameDocument={(id,t)=> router.post(
              `${base}/documents/${id}/rename`,{title:t},{ onSuccess:ok('Renamed') })}

            onCreateFolder={(name,pid)=> router.post(
              `${base}/documents/folder`,{name,parent_id:pid},{ onSuccess:ok('Folder created') })}
            onRenameFolder={(fid,name)=> router.post(
              `${base}/documents/folder/${fid}/rename`,{name},{ onSuccess:ok('Folder renamed') })}
            onMoveFolder={(fid,pid)=> router.post(
              `${base}/documents/folder/${fid}/move`,{parent_id:pid},{ onSuccess:ok('Folder moved') })}
            onDeleteFolder={fid=> router.delete(
              `${base}/documents/folder/${fid}`,{ onSuccess:ok('Folder deleted') })}

            onRequestDeleteDocument={()=>{}}
            onRequestDeleteFolder  ={()=>{}}
          />
        </TabsContent>

        {/* ---------- Notes ---------- */}
        <TabsContent value="notes" className="space-y-4">
          {notes.length ? notes.map(n=>(
            <Card key={n.id} className="flex justify-between p-4">
              <div className="text-sm">
                <p>{n.content}</p>
                <p className="text-xs text-muted-foreground">
                  {n.created_by} — {dayjs(n.created_at).format('MMM D YYYY')}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={()=> setDelId(n.id)}>
                <Trash2 className="h-4 w-4 text-red-600"/>
              </Button>
            </Card>
          )) : (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          )}

          {/* add note */}
          <div className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={e=>setNewNote(e.target.value)}
              rows={3}
              className="flex-1"
            />
            <Button
              disabled={!newNote.trim()}
              onClick={()=> router.post(`${base}/notes/store`,
                {content:newNote},
                { onSuccess:()=>{toast.success('Note added'); setNewNote(''); router.reload({only:['notes']}) } }
              )}
            >Add</Button>
          </div>

          {/* delete confirm */}
          {delId && (
            <div className="flex gap-2">
              <span>Delete note?</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={()=> router.delete(`${base}/notes/${delId}`,
                  { onSuccess:()=>{toast.success('Note deleted'); router.reload({only:['notes']})} }
                ).then(()=> setDelId(null))}>
                Delete
              </Button>
              <Button size="sm" variant="secondary" onClick={()=> setDelId(null)}>
                Cancel
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
