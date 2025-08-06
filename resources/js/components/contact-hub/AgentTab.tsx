/* Agent-specific tab for the Contact Hub
   ------------------------------------- */
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

import AgentChecklist  from '@/components/AgentChecklist'
import AgentFileExplorer, {
  Folder, Doc as AgentDocument
} from '@/components/FileExplorer'

/* ------------------------------------------------------------------ */

interface AgentNote { id:number; content:string; created_at:string; created_by:string }

interface Props {
  core      : any
  docs      : AgentDocument[]
  dirs      : Folder[]
  notes     : AgentNote[]
  sales     : any[] | { data:any[] } | null
  clients   : any[] | { data:any[] } | null
  checklist : any[]
}

/* ------------------------------------------------------------------ */
export default function AgentTab ({
  core, docs, dirs, notes,
  sales     : rawSales,
  clients   : rawClients,
  checklist,
}: Props) {

  /* normalise collections ------------------------------------------- */
  const sales   : any[] = Array.isArray(rawSales)   ? rawSales   : rawSales?.data   ?? []
  const clients : any[] = Array.isArray(rawClients) ? rawClients : rawClients?.data ?? []

  /* KPI cards -------------------------------------------------------- */
  const salesCount = sales.length
  const totalComm  = sales.reduce((sum:number,s:any)=>{
    const c = parseFloat(String(s.commission ?? 0))
    return sum + (isNaN(c) ? 0 : c)
  },0)

  const base = `/admin/agents/${core.agent_id}`
  const ok   = (msg:string)=>()=> toast.success(msg)

  /* notes ------------------------------------------------------------ */
  const [newNote,setNewNote] = useState('')
  const [delId ,setDelId ]   = useState<number|null>(null)

  /* prettify product strings ---------------------------------------- */
  const nice = (txt?:string|null)=>
    txt ? txt.replace(/[_-]+/g,' ')
            .replace(/\b\w/g,c=>c.toUpperCase())
        : 'Sale'

  /* ================================================================= */
  return (
    <div className="space-y-6">

      {/* ───── summary cards ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p><strong>Email:</strong> {core.email}</p>
            <p><strong>Phone:</strong> {core.phone   ?? '—'}</p>
            <p><strong>Company:</strong> {core.company ?? '—'}</p>
          </CardContent>
        </Card>

        {/* Sales KPI */}
        <Card>
          <CardHeader><CardTitle>Sales</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p><strong>Total sales:</strong> {salesCount}</p>
            <p><strong>Total commission:</strong>{' '}
              {totalComm.toLocaleString(undefined,{style:'currency',currency:'USD'})}
            </p>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader><CardTitle>Checklist</CardTitle></CardHeader>
          <CardContent>
            <AgentChecklist agentId={core.agent_id} checklist={checklist}/>
          </CardContent>
        </Card>
      </div>

      {/* ───── tabs ───── */}
      <Tabs defaultValue="docs">
        <TabsList className="mb-4">
          <TabsTrigger value="docs">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        {/* ---------- Documents ---------- */}
        <TabsContent value="docs">
          <AgentFileExplorer
            folders   ={dirs}
            documents ={docs}
            viewRoute={id=>route('admin.agents.documents.view',
                                 {agent:core.agent_id, document:id})}
            /* CRUD handlers … unchanged … */
            onFileUpload={(file,fid,title)=>{
              const fd=new FormData()
              fd.append('file',file)
              fd.append('folder_id',String(fid))
              fd.append('title',title)
              router.post(
                route('admin.agents.documents.upload',{agent:core.agent_id}),
                fd,{ onSuccess:ok('Uploaded') }
              )
            }}
            onDeleteDocument={id=> router.delete(
              route('admin.agents.documents.destroy',
                    {agent:core.agent_id,document:id}),
              { onSuccess:ok('Deleted') })}
            onMoveDocument  ={(id,fid)=> router.post(
              route('admin.agents.documents.move',
                    {agent:core.agent_id,document:id}),
              {folder_id:fid},{ onSuccess:ok('Moved') })}
            onRenameDocument={(id,t)=> router.post(
              route('admin.agents.documents.rename',
                    {agent:core.agent_id,document:id}),
              {title:t},{ onSuccess:ok('Renamed') })}

            onCreateFolder={(name,pid)=> router.post(
              route('admin.agents.documents.folder.store',{agent:core.agent_id}),
              {name,parent_id:pid},{ onSuccess:ok('Folder created') })}
            onRenameFolder={(fid,name)=> router.post(
              route('admin.agents.documents.folder.rename',{folder:fid}),
              {name},{ onSuccess:ok('Folder renamed') })}
            onMoveFolder={(fid,pid)=> router.post(
              route('admin.agents.documents.folder.move',{folder:fid}),
              {parent_id:pid},{ onSuccess:ok('Folder moved') })}
            onDeleteFolder={fid=> router.delete(
              route('admin.agents.documents.folder.destroy',{folder:fid}),
              { onSuccess:ok('Folder deleted') })}

            onRequestDeleteDocument={()=>{}}
            onRequestDeleteFolder  ={()=>{}}
          />
        </TabsContent>

        {/* ---------- Notes ---------- */}
        <TabsContent value="notes" className="space-y-4">
          {notes.length ? notes.map(n=>(
            <Card key={n.id} className="flex justify-between items-start p-4">
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
              onClick={()=> router.post(
                route('admin.agents.notes.store',{agent:core.agent_id}),
                {content:newNote},
                { onSuccess:()=>{ toast.success('Note added'); setNewNote(''); router.reload({only:['notes']}) } }
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
                onClick={()=> router.delete(
                  `${base}/notes/${delId}`,
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

        {/* ---------- Clients ---------- */}
        <TabsContent value="clients">
          {clients.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((c:any)=>{

                // derive the real contact id (if relation is eager-loaded)
                const contactId =
                  c.contact_id            // explicit field (if appended)
                  ?? c.contact?.id        // loaded relation
                  ?? undefined

                return (
                  <Card key={c.client_id ?? c.id} className="hover:shadow-lg">
                    <CardContent className="p-4 flex flex-col gap-2">
                      <div className="font-medium">
                        {c.firstname} {c.lastname}
                      </div>

                      {contactId ? (
                        <Link
                          href={`/admin/contacts/${contactId}/hub`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Open contact hub
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          (no contact record)
                        </span>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No clients for this agent.
            </p>
          )}
        </TabsContent>

        {/* ---------- Sales ---------- */}
        <TabsContent value="sales">
          {sales.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sales.map((s:any)=>(
                <Card key={s.id ?? s.sale_id} className="hover:shadow-lg">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="font-medium">{nice(s.product)}</div>
                    <div className="text-sm">
                      {(s.total_sale_amount ?? s.amount)
                        .toLocaleString(undefined,{style:'currency',currency:'USD'})}
                    </div>
                    <Link
                      href={route('admin.sales.show',{sale:s.id ?? s.sale_id})}
                      className="text-sm text-blue-600 hover:underline"
                    >View sale</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sales recorded.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
