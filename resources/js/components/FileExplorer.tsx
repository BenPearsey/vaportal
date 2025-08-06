/*  FileExplorer.tsx
    -----------------------------------------------------------------------
    Generic folder / document browser with full CRUD UI.  Works for any
    entity (client, agent, …) – just pass the appropriate callbacks.
*/
import { useState, useRef, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input  } from '@/components/ui/input'
import {
  Upload as UploadIcon, Folder as FolderIcon, FileText as FileIcon,
} from 'lucide-react'
import { toast } from 'sonner'

/* ────────────────────────────────────────────────────────────────────────
   Types & props
   ──────────────────────────────────────────────────────────────────── */
export interface Folder { id:number; name:string; parent_id:number|null }
export interface Doc    { id:number; folder_id:number|null; title?:string; path:string }

interface Props {
  folders   : Folder[]
  documents : Doc[]

  /* entity-specific actions (parent handles the API calls) */
  onFileUpload       :(file:File, folderId:number, title:string)=>void
  onDeleteDocument   :(docId:number)=>void
  onMoveDocument     :(docId:number, newFolderId:number)=>void
  onCreateFolder     :(name:string, parentId:number|null)=>void
  onRenameDocument   :(docId:number, newTitle:string)=>void
  onRenameFolder     :(folderId:number, newName:string)=>void
  onRequestDeleteDocument :(docId:number)=>void
  onRequestDeleteFolder   :(folderId:number)=>void

  /* open a document on double-click */
  viewRoute : (docId:number)=>string
  rootLabel?: string                                     // default “My Documents”
}

export default function FileExplorer ({
  folders, documents,
  onFileUpload, onDeleteDocument, onMoveDocument,
  onCreateFolder, onRenameDocument, onRenameFolder,
  onRequestDeleteDocument, onRequestDeleteFolder,
  viewRoute, rootLabel = 'My Documents',
}: Props) {

  /* ─── state ─────────────────────────────────────────── */
  const virtualRoot:Folder = { id:0, name:rootLabel, parent_id:null }
  const [folderPath, setFolderPath] = useState<Folder[]>([virtualRoot])
  const currentFolder = folderPath[folderPath.length-1]

  /* upload */
  const [uploadDlg , setUploadDlg ] = useState(false)
  const [uploadFile, setUploadFile] = useState<File|null>(null)
  const [uploadTitle, setUploadTitle] = useState('')

  /* new-folder */
  const [newFolderDlg, setNewFolderDlg] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  /* doc context menu */
  const [ctx, setCtx] = useState<{docId:number,x:number,y:number}|null>(null)
  /* rename doc */
  const [renameDlg , setRenameDlg ] = useState(false)
  const [renameId  , setRenameId  ] = useState<number|null>(null)
  const [renameText, setRenameText] = useState('')
  /* move doc */
  const [moveDlg   , setMoveDlg   ] = useState(false)
  const [moveId    , setMoveId    ] = useState<number|null>(null)

  /* folder context */
  const [fCtx, setFCtx] = useState<{folderId:number,x:number,y:number}|null>(null)
  const [fRenameDlg, setFRenameDlg] = useState(false)
  const [fRenameId , setFRenameId ] = useState<number|null>(null)
  const [fRenameTxt, setFRenameTxt] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)

  /* reset menus when clicking elsewhere */
  useEffect(()=>{
    const off = ()=>{ setCtx(null); setFCtx(null) }
    window.addEventListener('click',off); return()=>window.removeEventListener('click',off)
  },[])

  /* helpers ----------------------------------------------------------- */
  const displayedFolders = folders.filter(f =>
    currentFolder.id === 0 ? f.parent_id === null : f.parent_id === currentFolder.id)

  const displayedDocs = documents.filter(d =>
    currentFolder.id === 0 ? d.folder_id === null : d.folder_id === currentFolder.id)

  const items = [
    ...displayedFolders.map(f=>({type:'folder', ...f})),
    ...displayedDocs   .map(d=>({type:'doc'   , ...d})),
  ].sort((a:any,b:any)=>{
    if(a.type===b.type){
      const aName = a.type==='folder'?a.name:(a.title||a.path)
      const bName = b.type==='folder'?b.name:(b.title||b.path)
      return String(aName).localeCompare(String(bName))
    }
    return a.type==='folder'?-1:1
  })

  /* upload submit */
  const doUpload = ()=>{
    if(!uploadFile) return
    onFileUpload(uploadFile, currentFolder.id, uploadTitle)
    toast.success('Uploaded')
    setUploadDlg(false); setUploadFile(null); setUploadTitle('')
  }

  /* ─── UI ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>

      {/* nav header */}
      <div className="p-4 border-b">
        <h3 className="mb-2 font-semibold">
          {currentFolder.id===0? rootLabel : currentFolder.name}
        </h3>

        {folderPath.length>1 && (
          <Button variant="outline"
                  onClick={()=> setFolderPath(folderPath.slice(0,-1))}>
            Back
          </Button>
        )}

        <div className="mt-2 flex gap-2">
          <Button onClick={()=> setNewFolderDlg(true)}>Create Folder</Button>
          <Button onClick={()=> setUploadDlg(true)}>
            <UploadIcon className="h-4 w-4 mr-1"/> Upload
          </Button>
        </div>
      </div>

      {/* items grid */}
      <div className="flex-1 p-4 overflow-auto">
        {items.length ? (
          <div className="grid grid-cols-6 gap-4">
            {items.map((it:any)=> it.type==='folder' ? (
              /* folder tile */
              <div key={`f-${it.id}`}
                   className="flex flex-col items-center p-4 border rounded
                              cursor-pointer hover:bg-gray-100"
                   onClick={()=> setFolderPath([...folderPath,it])}
                   onDragOver={e=>e.preventDefault()}
                   onDrop={e=>{
                     e.preventDefault()
                     const id = Number(e.dataTransfer.getData('text/plain'))
                     if(!Number.isNaN(id)){
                       onMoveDocument(id,it.id)
                       toast.success('Document moved')
                     }
                   }}
                   onContextMenu={e=>{
                     e.preventDefault()
                     const rect = containerRef.current?.getBoundingClientRect()
                     setFCtx({
                       folderId:it.id,
                       x:e.clientX-(rect?.left??0),
                       y:e.clientY-(rect?.top??0)
                     })
                   }}>
                <FolderIcon className="h-8 w-8 mb-2"/>
                <span className="text-sm">{it.name}</span>
              </div>
            ) : (
              /* doc tile */
              <div key={`d-${it.id}`}
                   className="flex flex-col items-center"
                   draggable
                   onDragStart={e=> e.dataTransfer.setData('text/plain',String(it.id))}
                   onDoubleClick={()=> window.open(viewRoute(it.id),'_blank')}
                   onContextMenu={e=>{
                     e.preventDefault()
                     const rect = containerRef.current?.getBoundingClientRect()
                     setCtx({
                       docId:it.id,
                       x:e.clientX-(rect?.left??0),
                       y:e.clientY-(rect?.top??0)
                     })
                   }}>
                <FileIcon className="h-10 w-10"/>
                <div className="text-xs mt-1 text-center">
                  {it.title?.trim() || it.path.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        ): <p className="text-sm text-muted-foreground">No items.</p>}
      </div>

      {/* ============  dialogs & menus  ============ */}

      {/* upload */}
      <Dialog open={uploadDlg} onOpenChange={setUploadDlg}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload</DialogTitle></DialogHeader>
          <Input type="file" onChange={e=>{
            const f=e.target.files?.[0]; if(f){ setUploadFile(f); setUploadTitle(f.name) }
          }} />
          <Input placeholder="Title" value={uploadTitle}
                 onChange={e=>setUploadTitle(e.target.value)} />
          <Button onClick={doUpload} disabled={!uploadFile}>Upload</Button>
        </DialogContent>
      </Dialog>

      {/* new folder */}
      <Dialog open={newFolderDlg} onOpenChange={setNewFolderDlg}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create folder</DialogTitle></DialogHeader>
          <Input placeholder="Folder name" value={newFolderName}
                 onChange={e=>setNewFolderName(e.target.value)} />
          <Button onClick={()=>{
            onCreateFolder(newFolderName, currentFolder.id===0?null:currentFolder.id)
            toast.success('Folder created')
            setNewFolderDlg(false); setNewFolderName('')
          }} disabled={!newFolderName.trim()}>Create</Button>
        </DialogContent>
      </Dialog>

      {/* doc context menu */}
      {ctx && (
        <div className="absolute bg-white border rounded shadow p-2 z-50"
             style={{top:ctx.y,left:ctx.x}}>
          <div className="cursor-pointer p-1 text-sm hover:bg-gray-100"
               onClick={()=>{
                 setRenameId(ctx.docId)
                 const d=documents.find(d=>d.id===ctx.docId)
                 setRenameText(d?.title||d?.path.split('/').pop()||'')
                 setRenameDlg(true); setCtx(null)
               }}>Rename</div>
          <div className="cursor-pointer p-1 text-sm hover:bg-gray-100"
               onClick={()=>{ setMoveId(ctx.docId); setMoveDlg(true); setCtx(null) }}>
            Move
          </div>
          <div className="cursor-pointer p-1 text-sm hover:bg-gray-100"
               onClick={()=>{ onRequestDeleteDocument(ctx.docId); setCtx(null) }}>
            Delete
          </div>
        </div>
      )}

      {/* rename doc */}
      <Dialog open={renameDlg} onOpenChange={setRenameDlg}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename document</DialogTitle></DialogHeader>
          <Input value={renameText} onChange={e=>setRenameText(e.target.value)}/>
          <Button onClick={()=>{ if(renameId!==null){
            onRenameDocument(renameId,renameText)
            toast.success('Renamed')
            setRenameDlg(false)
          }}}>Save</Button>
        </DialogContent>
      </Dialog>

      {/* move doc */}
      <Dialog open={moveDlg} onOpenChange={setMoveDlg}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move document</DialogTitle></DialogHeader>
          <Button variant="outline" className="w-full text-left mb-2"
                  onClick={()=>{ if(moveId!==null){
                    onMoveDocument(moveId,0); toast.success('Document moved'); setMoveDlg(false)
                  }}}>
            {rootLabel}
          </Button>
          {folders.map(f=>(
            <Button key={f.id} variant="outline" className="w-full text-left mb-1"
                    onClick={()=>{ if(moveId!==null){
                      onMoveDocument(moveId,f.id); toast.success('Document moved'); setMoveDlg(false)
                    }}}>
              {f.name}
            </Button>
          ))}
        </DialogContent>
      </Dialog>

      {/* folder context menu */}
      {fCtx && (
        <div className="absolute bg-white border rounded shadow p-2 z-50"
             style={{top:fCtx.y,left:fCtx.x}}>
          <div className="cursor-pointer p-1 text-sm hover:bg-gray-100"
               onClick={()=>{ setFRenameId(fCtx.folderId)
                               const f=folders.find(fl=>fl.id===fCtx.folderId)
                               setFRenameTxt(f?.name||'')
                               setFRenameDlg(true); setFCtx(null) }}>Rename</div>
          <div className="cursor-pointer p-1 text-sm hover:bg-gray-100"
               onClick={()=>{ onRequestDeleteFolder(fCtx.folderId); setFCtx(null) }}>
            Delete
          </div>
        </div>
      )}

      {/* rename folder */}
      <Dialog open={fRenameDlg} onOpenChange={setFRenameDlg}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename folder</DialogTitle></DialogHeader>
          <Input value={fRenameTxt} onChange={e=>setFRenameTxt(e.target.value)}/>
          <Button onClick={()=>{ if(fRenameId!==null){
            onRenameFolder(fRenameId,fRenameTxt)
            toast.success('Folder renamed')
            setFRenameDlg(false)
          }}}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
