/* resources/js/pages/admin/admin-documents.tsx */
/* eslint-disable react/jsx-no-bind */
import React, { useState, DragEvent } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-admin';

import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableHead, TableRow,
  TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import {
  Folder   as FolderIcon,
  FileText as FileIcon,
  MoveRight as MoveIcon,
  Pencil   as PencilIcon,
  Trash2   as TrashIcon,
  Eye      as EyeIcon,
  Download as DownloadIcon,
} from 'lucide-react';

import { toast } from 'sonner';
import type { BreadcrumbItem } from '@/types';

/* ---------- Types received from backend ------------------- */
interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Doc {
  id: number;
  folder_id: number | null;
  title: string | null;
  url: string | null;
  created_at: string;
}
/* ---------------------------------------------------------- */

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home',             href: '/admin/dashboard'      },
  { title: 'Admin Documents',  href: '/admin/admin-documents'},
];

const nn = (n: number | null) => (n == null ? '' : String(n));

export default function AdminDocuments() {
  /* ---------- props from backend -------------------------- */
/* ---------- props from backend -------------------------- */
const {
  folders = [],        // 👈 fallback to empty array
  documents = [],      // 👈 fallback to empty array
} = usePage().props as Partial<{
  folders: Folder[];
  documents: Doc[];
}>;


  /* ---------- navigation / drill-down --------------------- */
  const [path, setPath]        = useState<Folder[]>([{
    id: 0, name: 'Root', parent_id: null,
  }]);
  const here = path[path.length - 1];

  const childFolders = folders.filter(f =>
    here.id === 0 ? f.parent_id == null : f.parent_id === here.id);

  const childDocs = documents.filter(d =>
    here.id === 0 ? d.folder_id == null : d.folder_id === here.id);

  /* ---------- global search ------------------------------- */
  const [search, setSearch] = useState('');
  const fName = (s:string)=>s.toLowerCase().includes(search.toLowerCase());

  /* ---------- dialogs & action state ---------------------- */
  const [createOpen,setCreateOpen]  = useState(false);
  const [newName,setNewName]        = useState('');
  const [renF,setRenF]              = useState<{id:number,name:string}|null>(null);
  const [renD,setRenD]              = useState<{id:number,title:string}|null>(null);
  const [mvF,setMvF]                = useState<number|null>(null);
  const [mvD,setMvD]                = useState<number|null>(null);
  const [confirm,setConfirm]        = useState<{kind:'doc'|'folder';id:number}|null>(null);

  /* ---------- upload - via dialog OR drag-and-drop -------- */
  const [uploadOpen,setUploadOpen]  = useState(false);
  const [file,setFile]              = useState<File|null>(null);
  const [title,setTitle]            = useState('');

  /* ---------- inertia helpers ----------------------------- */
  const ok=(msg:string)=>({onSuccess:()=>{
    toast.success(msg);
    router.reload({only:['folders','documents']});
  }});

  const renameFolder = (id: number, name: string) =>
    router.post(
      route('admin.admin-documents.folders.rename', { folder: id }),
      { name },                      // ← controller expects “name”
      ok('Folder renamed')
    );

  const renameDoc = (id:number,title:string)=>
    router.post(route('admin.admin-documents.rename',id),{title},ok('Document renamed'));

  const moveFolder = (id: number, target: number | null) =>
    router.post(
      route('admin.admin-documents.folders.move',   { folder: id }),
      { parent_id: nn(target) },                    // ← controller expects “parent_id”
      ok('Folder moved')
    );

  const moveDoc = (id:number,target:number|null)=>
    router.post(route('admin.admin-documents.move',id),{folder_id:nn(target)},ok('Document moved'));

  const deleteFolder = (id: number) =>
    router.delete(
      route('admin.admin-documents.folders.destroy', { folder: id }),
      ok('Folder deleted')
    );

  const deleteDoc = (id:number)=>
    router.delete(route('admin.admin-documents.destroy',id),ok('Document deleted'));

  /* ---------- drag helpers -------------------------------- */
  const drag=(e:DragEvent,id:number,kind:'doc'|'folder')=>{
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('application/json',JSON.stringify({kind,id}));
  };
  const drop=(e:DragEvent,target:number|null)=>{
    e.preventDefault();
    const f=e.dataTransfer.files?.[0];
    if(f){                       // upload
      const fd=new FormData();
      fd.append('file',f);
      fd.append('title',title||f.name);
      fd.append('folder_id',nn(target));
      router.post(route('admin.admin-documents.store'),fd,ok('Uploaded'));
      return;
    }
    const raw=e.dataTransfer.getData('application/json');
    if(!raw) return;
    const {kind,id}=JSON.parse(raw) as {kind:'doc'|'folder';id:number};
    kind==='folder'?moveFolder(id,target):moveDoc(id,target);
  };

  /* ================= RENDER =============================== */
  return(
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Documents"/>

      {/* ---- header  ------------------------------------ */}
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle>Admin Documents</CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">
              {path.map((p,i)=>(
                <React.Fragment key={p.id}>
                  {i>0&&<span> / </span>}<span className="font-medium">{p.name}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            {path.length>1&&(
              <Button variant="outline" size="sm"
                onClick={()=>setPath(p=>p.slice(0,-1))}>Back</Button>)}
            <Button size="sm" onClick={()=>setCreateOpen(true)}>New Folder</Button>
            <Button size="sm" onClick={()=>setUploadOpen(true)}>Upload</Button>
          </div>
        </CardHeader>

        {/* ---- table ------------------------------------- */}
        <CardContent className="p-4 flex-1 overflow-auto">
          <Input
            placeholder="Search…"
            value={search}
            onChange={e=>setSearch(e.target.value)}
            className="max-w-xs mb-4"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* folders */}
              {childFolders.filter(f=>fName(f.name)).map(f=>(
                <TableRow key={`f-${f.id}`}
                  onClick={()=>setPath(p=>[...p,f])}
                  draggable onDragStart={e=>drag(e,f.id,'folder')}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>drop(e,f.id)}
                  className="cursor-pointer hover:bg-muted"
                >
                  <TableCell className="flex items-center gap-2">
                    <FolderIcon size={18}/> {f.name}
                  </TableCell>
                  <TableCell>Folder</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon"
                      onClick={e=>{e.stopPropagation();setRenF({id:f.id,name:f.name});}}>
                      <PencilIcon size={16}/>
                    </Button>
                    <Button variant="ghost" size="icon"
                      onClick={e=>{e.stopPropagation();setMvF(f.id);}}>
                      <MoveIcon size={16}/>
                    </Button>
                    <Button variant="ghost" size="icon"
                      onClick={e=>{e.stopPropagation();setConfirm({kind:'folder',id:f.id});}}>
                      <TrashIcon size={16} className="text-red-600"/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* docs */}
              {childDocs.filter(d=>fName(d.title??d.url??'')).map(d=>(
                <TableRow key={`d-${d.id}`}
                  draggable onDragStart={e=>drag(e,d.id,'doc')}
                >
                  <TableCell className="flex items-center gap-2">
                    <FileIcon size={18}/> {d.title}
                  </TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <a href={route('admin.admin-documents.view',d.id)} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon"><EyeIcon size={16}/></Button>
                    </a>
                    <a href={route('admin.admin-documents.view',d.id)} download>
                      <Button variant="ghost" size="icon"><DownloadIcon size={16}/></Button>
                    </a>
                    <Button variant="ghost" size="icon"
                      onClick={()=>setRenD({id:d.id,title:d.title||''})}>
                      <PencilIcon size={16}/>
                    </Button>
                    <Button variant="ghost" size="icon"
                      onClick={()=>setMvD(d.id)}>
                      <MoveIcon size={16}/>
                    </Button>
                    <Button variant="ghost" size="icon"
                      onClick={()=>setConfirm({kind:'doc',id:d.id})}>
                      <TrashIcon size={16} className="text-red-600"/>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {childFolders.length===0 && childDocs.length===0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">
                  Empty folder
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* drag-&-drop zone */}
          <div
            className="border-2 border-dashed rounded p-6 text-center mt-6 text-muted-foreground"
            onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='move';}}
            onDrop={e=>drop(e, here.id===0?null:here.id)}
          >
            Drag &amp; drop files here to upload into <strong>{here.name}</strong>
          </div>
        </CardContent>
      </Card>

      {/* ========== dialogs ================================== */}
      {/* create folder */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader>
          <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Folder name"/>
          <Button className="mt-4" disabled={!newName.trim()}
            onClick={()=>{
              router.post(route('admin.admin-documents.folders.store'),{
                folder:1,name:newName,parent_id:nn(here.id===0?null:here.id)
              },ok('Folder created'));
              setNewName('');setCreateOpen(false);
            }}>Create</Button>
        </DialogContent>
      </Dialog>

      {/* upload */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload</DialogTitle></DialogHeader>
          <Input type="file" onChange={e=>{
            const f=e.target.files?.[0];if(f){setFile(f);setTitle(f.name);}
          }}/>
          <Input className="mt-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"/>
          <Button className="mt-4" disabled={!file}
            onClick={()=>{
              const fd=new FormData();
              fd.append('file',file!);
              fd.append('title',title);
              fd.append('folder_id',nn(here.id===0?null:here.id));
              router.post(route('admin.admin-documents.store'),fd,ok('Uploaded'));
              setUploadOpen(false);setFile(null);setTitle('');
            }}>Upload</Button>
        </DialogContent>
      </Dialog>

      {/* rename folder */}
      <Dialog open={!!renF} onOpenChange={()=>setRenF(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <Input value={renF?.name||''} onChange={e=>setRenF(renF?{...renF,name:e.target.value}:null)}/>
          <Button className="mt-4" onClick={()=>{if(renF)renameFolder(renF.id,renF.name);setRenF(null);}}>
            Save</Button>
        </DialogContent>
      </Dialog>

      {/* rename doc */}
      <Dialog open={!!renD} onOpenChange={()=>setRenD(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Document</DialogTitle></DialogHeader>
          <Input value={renD?.title||''} onChange={e=>setRenD(renD?{...renD,title:e.target.value}:null)}/>
          <Button className="mt-4" onClick={()=>{if(renD)renameDoc(renD.id,renD.title);setRenD(null);}}>
            Save</Button>
        </DialogContent>
      </Dialog>

      {/* move folder */}
      <Dialog open={mvF!=null} onOpenChange={()=>setMvF(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move Folder</DialogTitle></DialogHeader>
          <Button variant="outline" onClick={()=>{moveFolder(mvF!,null);setMvF(null);}}>
            <FolderIcon size={16} className="mr-2"/> Root
          </Button>
          {folders.filter(f=>f.id!==mvF).map(f=>(
            <Button key={f.id} variant="outline" className="mt-2"
              onClick={()=>{moveFolder(mvF!,f.id);setMvF(null);}}>
              <FolderIcon size={16} className="mr-2"/> {f.name}
            </Button>
          ))}
        </DialogContent>
      </Dialog>

      {/* move doc */}
      <Dialog open={mvD!=null} onOpenChange={()=>setMvD(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move Document</DialogTitle></DialogHeader>
          <Button variant="outline" onClick={()=>{moveDoc(mvD!,null);setMvD(null);}}>
            <FolderIcon size={16} className="mr-2"/> Root
          </Button>
          {folders.map(f=>(
            <Button key={f.id} variant="outline" className="mt-2"
              onClick={()=>{moveDoc(mvD!,f.id);setMvD(null);}}>
              <FolderIcon size={16} className="mr-2"/> {f.name}
            </Button>
          ))}
        </DialogContent>
      </Dialog>

      {/* delete / confirm */}
      <Dialog open={!!confirm} onOpenChange={()=>setConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete permanently?</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="destructive" onClick={()=>{
              if(!confirm) return;
              confirm.kind==='folder'?deleteFolder(confirm.id):deleteDoc(confirm.id);
              setConfirm(null);
            }}>Yes</Button>
            <Button onClick={()=>setConfirm(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
