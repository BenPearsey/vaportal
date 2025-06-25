/* resources/js/pages/admin/forms-resources.tsx */
/* eslint-disable react/jsx-no-bind */

import React, { useState, useEffect, DragEvent } from 'react';
import { Head, router, usePage }          from '@inertiajs/react';
import AppLayout                          from '@/layouts/app-layout-admin';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger }    from '@/components/ui/tabs';
import { Input }                          from '@/components/ui/input';
import { Button }                         from '@/components/ui/button';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Folder   as FolderIcon,
  FileText as FileIcon,
  Trash2   as TrashIcon,
  MoveRight as MoveIcon,
  Pencil   as PencilIcon,
  Eye      as EyeIcon,
  Download as DownloadIcon,
  User     as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

type Bucket = 0|1|2;

interface Folder {
  id: number;
  name: string;
  parent_id: number|null;
  bucket: Bucket;
  published_for_agents: boolean;
  published_for_clients: boolean;
}

interface Doc {
  id: number;
  folder_id: number|null;
  title: string|null;
  url: string|null;
  published_for_agents: boolean;
  published_for_clients: boolean;
  created_at: string;
  uploader: {
    id: number;
    admin?: {
      firstname: string;
      lastname:  string;
    }
  }|null;
}

const nn = (n: number|null) => (n == null ? '' : String(n));
const scopeFor = (b: Bucket) =>
  b === 0 ? 'general' : b === 1 ? 'agents' : 'clients';

export default function FormsResourcesPage() {
  const { folders, documents } = usePage<{
    folders: Folder[];
    documents: Doc[];
  }>().props;

  // ── Bucket & Tabs ───────────────────────────────
  const [tab, setTab] = useState<'general'|'agents'|'clients'>('general');
  const bucket: Bucket = tab === 'general'
    ? 0 : tab === 'agents' ? 1 : 2;

  const rootFolder: Folder = {
    id: 0,
    name: bucket === 0 ? 'Root' : bucket === 1 ? 'Agents' : 'Clients',
    parent_id: null,
    bucket,
    published_for_agents: false,
    published_for_clients: false,
  };

  const bucketFolders = folders.filter(f => f.bucket === bucket);
  const bucketDocs = bucket === 0
    ? documents
    : documents.filter(d =>
        bucket === 1 ? d.published_for_agents : d.published_for_clients
      );

  // ── Breadcrumb Drill ─────────────────────────────
  const [path, setPath] = useState<Folder[]>([rootFolder]);
  const here = path[path.length - 1];

  const childFolders = bucketFolders.filter(f =>
    here.id === rootFolder.id
      ? f.parent_id == null
      : f.parent_id === here.id
  );
  const childDocs = (here.id === rootFolder.id && bucket !== 0)
    ? bucketDocs
    : bucketDocs.filter(d =>
        here.id === rootFolder.id
          ? d.folder_id == null
          : d.folder_id === here.id
      );

  // ── Global & Column Filters ──────────────────────
  const [filter, setFilter] = useState('');
  const [colFilters, setColFilters] = useState({
    name:     '',
    type:     'All',
    agents:   'All',
    clients:  'All',
    uploader: '',
  });

  const applyColumnFiltersToFolder = (f: Folder) => {
    if (colFilters.name && !f.name.toLowerCase().includes(colFilters.name.toLowerCase())) return false;
    if (colFilters.type !== 'All' && colFilters.type !== 'Folder') return false;
    if (colFilters.agents !== 'All' &&
        (f.published_for_agents ? 'Published' : 'Unpublished') !== colFilters.agents
    ) return false;
    if (colFilters.clients !== 'All' &&
        (f.published_for_clients ? 'Published' : 'Unpublished') !== colFilters.clients
    ) return false;
    return true;
  };
  const applyColumnFiltersToDoc = (d: Doc) => {
    if (colFilters.name && !(d.title ?? '').toLowerCase().includes(colFilters.name.toLowerCase())) return false;
    if (colFilters.type !== 'All' && colFilters.type !== 'File') return false;
    if (colFilters.agents !== 'All' &&
        (d.published_for_agents ? 'Published' : 'Unpublished') !== colFilters.agents
    ) return false;
    if (colFilters.clients !== 'All' &&
        (d.published_for_clients ? 'Published' : 'Unpublished') !== colFilters.clients
    ) return false;
    if (colFilters.uploader && d.uploader?.admin) {
      const fullName = `${d.uploader.admin.firstname} ${d.uploader.admin.lastname}`.toLowerCase();
      if (!fullName.includes(colFilters.uploader.toLowerCase())) return false;
    }
    return true;
  };

  const filteredFolders = childFolders
    .filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
    .filter(applyColumnFiltersToFolder);

  const filteredDocs = childDocs
    .filter(d => (d.title ?? '').toLowerCase().includes(filter.toLowerCase()))
    .filter(applyColumnFiltersToDoc);

  // ── Dialog & Action State ───────────────────────
  const [renF, setRenF] = useState<{id:number,name:string}|null>(null);
  const [renD, setRenD] = useState<{id:number,title:string}|null>(null);
  const [mvF,  setMvF]  = useState<number|null>(null);
  const [mvD,  setMvD]  = useState<number|null>(null);
  const [confirm, setConfirm] = useState<{kind:'doc'|'folder';id:number}|null>(null);

  // ── New Folder & Upload Dialog State ───────────
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName,    setNewFolderName]    = useState('');
  const [uploadOpen,       setUploadOpen]       = useState(false);
  const [file,             setFile]             = useState<File|null>(null);
  const [title,            setTitle]            = useState('');
  const [toA,              setToA]              = useState(false);
  const [toC,              setToC]              = useState(false);
  const [uploading,        setUploading]        = useState(false);

  // ── Inertia Handlers ────────────────────────────
  const ok = (msg: string) => ({
    onSuccess: () => {
      toast.success(msg);
      router.reload({ only: ['folders','documents'] });
    },
  });

  const renameFolder = (id: number, name: string) =>
    router.post(route('admin.resources.folders.rename', id), { name }, ok('Folder renamed'));

  const renameDoc = (id: number, title: string) =>
    router.post(route('admin.resources.documents.rename', id), { title }, ok('Document renamed'));

  const moveFolder = (id: number, target: number|null) =>
    router.post(route('admin.resources.folders.move', id),
                { parent_id: nn(target) }, ok('Folder moved'));

  const moveDoc = (id: number, target: number|null) =>
    router.post(route('admin.resources.documents.move', id),
                { folder_id: nn(target) }, ok('Document moved'));

  const togglePub = (id: number, col: 'published_for_agents'|'published_for_clients', v: boolean) =>
    router.patch(route('admin.resources.documents.toggle', id), { column: col, value: v }, ok('Publish toggled'));

  const deleteFolder = (id: number) =>
    router.delete(route('admin.resources.folders.destroy', id), ok('Folder deleted'));

  const deleteDoc = (id: number, scope: 'general'|'agents'|'clients') =>
    router.delete(route('admin.resources.documents.destroy', id),
                  { data: { scope } }, ok('Document deleted'));

  // ── Drag & Drop ────────────────────────────────
  const drag = (e: DragEvent, id: number, kind: 'doc'|'folder') => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json',
      JSON.stringify({ kind, id })
    );
  };
  const drop = (e: DragEvent, target: number|null) => {
    e.preventDefault();
    // file upload
    const f = e.dataTransfer.files?.[0];
    if (f) {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('title', title || f.name);
      fd.append('folder_id', nn(target));
      fd.append('published_for_agents',
        bucket === 1 || (bucket === 0 && toA) ? '1' : '0'
      );
      fd.append('published_for_clients',
        bucket === 2 || (bucket === 0 && toC) ? '1' : '0'
      );
      setUploading(true);
      router.post(
        route('admin.resources.documents.store'),
        fd,
        {
          ...ok('Uploaded'),
          onFinish: () => {
            setUploading(false);
            setUploadOpen(false);
          }
        }
      );
      return;
    }
    // move existing
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    const { kind, id } = JSON.parse(raw) as { kind:'doc'|'folder'; id:number };
    kind === 'folder' ? moveFolder(id, target) : moveDoc(id, target);
  };

  return (
    <AppLayout>
      <Head title="Forms & Resources" />

      <Tabs
        value={tab}
        onValueChange={v => setTab(v as any)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="h-full flex flex-col">
        {/* ── Header / Breadcrumbs ───────────────────── */}
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <CardTitle>Forms &amp; Resources</CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">
              {path.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 && <span> / </span>}
                  <span className="font-medium">{p.name}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {path.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPath(p => p.slice(0, -1))}
            >
              Back
            </Button>
          )}
        </CardHeader>

        {/* ── Table + Controls ───────────────────────── */}
        <CardContent className="p-4 flex-1 overflow-auto">
          {/* Global Filter + New Folder + Upload */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <Input
              placeholder="Filter by name…"
              value={filter}
              onChange={e => setFilter(e.currentTarget.value)}
              className="flex-1 max-w-sm"
            />
            <Button onClick={() => setCreateFolderOpen(true)}>
              New Folder
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>

          {/* Explorer Table */}
          <Table>
            <TableHeader>
              {/* — Column headings — */}
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Agents</TableHead>
                <TableHead className="text-center">Clients</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
              {/* — Column filters — */}
              <TableRow>
                <TableHead>
                  <Input
                    placeholder="Filter Name"
                    value={colFilters.name}
                    onChange={e =>
                      setColFilters(f => ({ ...f, name: e.target.value }))
                    }
                    size="sm"
                  />
                </TableHead>
                <TableHead>
                  <select
                    className="w-full h-8 rounded border px-2"
                    value={colFilters.type}
                    onChange={e =>
                      setColFilters(f => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option>All</option>
                    <option>Folder</option>
                    <option>File</option>
                  </select>
                </TableHead>
                <TableHead className="text-center">
                  <select
                    className="w-full h-8 rounded border px-2"
                    value={colFilters.agents}
                    onChange={e =>
                      setColFilters(f => ({ ...f, agents: e.target.value }))
                    }
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Unpublished</option>
                  </select>
                </TableHead>
                <TableHead className="text-center">
                  <select
                    className="w-full h-8 rounded border px-2"
                    value={colFilters.clients}
                    onChange={e =>
                      setColFilters(f => ({ ...f, clients: e.target.value }))
                    }
                  >
                    <option>All</option>
                    <option>Published</option>
                    <option>Unpublished</option>
                  </select>
                </TableHead>
                <TableHead>
                  <Input
                    placeholder="Filter Uploader"
                    value={colFilters.uploader}
                    onChange={e =>
                      setColFilters(f => ({ ...f, uploader: e.target.value }))
                    }
                    size="sm"
                  />
                </TableHead>
                <TableHead /> {/* no filter for date */}
                <TableHead /> {/* no filter for actions */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* — Folders — */}
              {filteredFolders.map(f => (
                <TableRow
                  key={`folder-${f.id}`}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setPath(p => [...p, f])}
                  onContextMenu={e => {
                    e.preventDefault();
                    setRenF({ id: f.id, name: f.name });
                  }}
                  draggable
                  onDragStart={e => drag(e, f.id, 'folder')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => drop(e, f.id)}
                >
                  <TableCell className="flex items-center space-x-2">
                    <FolderIcon className="w-5 h-5 text-primary" />
                    <span>{f.name}</span>
                  </TableCell>
                  <TableCell>Folder</TableCell>
                  <TableCell className="text-center">
                    <UserIcon
                      size={16}
                      className={
                        f.published_for_agents
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <UserIcon
                      size={16}
                      className={
                        f.published_for_clients
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }
                    />
                  </TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={e => {
                        e.stopPropagation();
                        setMvF(f.id);
                      }}
                    >
                      <MoveIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setConfirm({ kind: 'folder', id: f.id })
                      }
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* — Documents — */}
              {filteredDocs.map(d => (
                <TableRow
                  key={`doc-${d.id}`}
                  draggable
                  onDragStart={e => drag(e, d.id, 'doc')}
                >
                  <TableCell className="flex items-center space-x-2">
                    <FileIcon className="w-5 h-5 text-primary" />
                    <span>{d.title}</span>
                  </TableCell>
                  <TableCell>File</TableCell>
                  <TableCell className="text-center">
                    <UserIcon
                      size={16}
                      className={
                        d.published_for_agents
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }
                      onClick={() =>
                        togglePub(
                          d.id,
                          'published_for_agents',
                          !d.published_for_agents
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <UserIcon
                      size={16}
                      className={
                        d.published_for_clients
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }
                      onClick={() =>
                        togglePub(
                          d.id,
                          'published_for_clients',
                          !d.published_for_clients
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {d.uploader?.admin
                      ? `${d.uploader.admin.firstname} ${d.uploader.admin.lastname}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(d.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex justify-end space-x-2">
                    {/* ◉ VIEW as plain <a> tag */}
                    <a
                      href={route('admin.forms-resources.show', d.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </a>

                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={route('admin.forms-resources.show', d.id)}
                        download
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </a>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setRenD({ id: d.id, title: d.title || '' })
                      }
                    >
                      <PencilIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMvD(d.id)}
                    >
                      <MoveIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setConfirm({ kind: 'doc', id: d.id })
                      }
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* — Empty state — */}
              {filteredFolders.length === 0 && filteredDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Nothing here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Drag-&-Drop zone */}
          <div
            className="border-2 border-dashed rounded p-6 text-center text-muted-foreground mt-8"
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={e => drop(e, here.id === rootFolder.id ? null : here.id)}
          >
            Drag & Drop files here to upload into <strong>{here.name}</strong>
          </div>
        </CardContent>
      </Card>

      {/* ── Create Folder Dialog ─────────────────────── */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
          />
          <Button
            className="mt-4"
            disabled={!newFolderName.trim()}
            onClick={() => {
              router.post(
                route('admin.resources.folders.store'),
                {
                  name:      newFolderName.trim(),
                  bucket,
                  parent_id: nn(here.id === rootFolder.id ? null : here.id),
                },
                ok('Folder created')
              );
              setNewFolderName('');
              setCreateFolderOpen(false);
            }}
          >
            Create
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Upload Dialog ────────────────────────────── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload</DialogTitle>
          </DialogHeader>
          <Input
            type="file"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                setTitle(f.name);
              }
            }}
          />
          <Input
            className="mt-2"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          {bucket === 0 && (
            <div className="flex gap-8 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toA}
                  onChange={e => setToA(e.target.checked)}
                />{' '}
                Agents
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toC}
                  onChange={e => setToC(e.target.checked)}
                />{' '}
                Clients
              </label>
            </div>
          )}
          <Button
            className="mt-4"
            disabled={!file}
            onClick={() => {
              const fd = new FormData();
              fd.append('file', file!);
              fd.append('title', title);
              fd.append(
                'folder_id',
                nn(here.id === rootFolder.id ? null : here.id)
              );
              fd.append(
                'published_for_agents',
                bucket === 1 || (bucket === 0 && toA) ? '1' : '0'
              );
              fd.append(
                'published_for_clients',
                bucket === 2 || (bucket === 0 && toC) ? '1' : '0'
              );
              setUploading(true);
              router.post(route('admin.resources.documents.store'), fd, {
                ...ok('Uploaded'),
                onFinish: () => {
                  setUploading(false);
                  setUploadOpen(false);
                },
              });
            }}
          >
            Upload
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Rename Folder Dialog ────────────────────── */}
      <Dialog open={!!renF} onOpenChange={() => setRenF(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <Input
            value={renF?.name || ''}
            onChange={e =>
              setRenF(renF ? { ...renF, name: e.target.value } : null)
            }
          />
          <Button
            className="mt-4"
            onClick={() => {
              if (renF) renameFolder(renF.id, renF.name);
              setRenF(null);
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Rename Document Dialog ──────────────────── */}
      <Dialog open={!!renD} onOpenChange={() => setRenD(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Document</DialogTitle></DialogHeader>
          <Input
            value={renD?.title || ''}
            onChange={e =>
              setRenD(renD ? { ...renD, title: e.target.value } : null)
            }
          />
          <Button
            className="mt-4"
            onClick={() => {
              if (renD) renameDoc(renD.id, renD.title);
              setRenD(null);
            }}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Move Folder Dialog ──────────────────────── */}
      <Dialog open={mvF != null} onOpenChange={() => setMvF(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move Folder</DialogTitle></DialogHeader>
          <Button
            variant="outline"
            onClick={() => { moveFolder(mvF!, null); setMvF(null); }}
          >
            <FolderIcon className="w-4 h-4 mr-2" /> Root
          </Button>
          {bucketFolders.filter(f => f.id !== mvF).map(f => (
            <Button
              key={f.id}
              variant="outline"
              className="mt-2"
              onClick={() => { moveFolder(mvF!, f.id); setMvF(null); }}
            >
              <FolderIcon className="w-4 h-4 mr-2" /> {f.name}
            </Button>
          ))}
        </DialogContent>
      </Dialog>

      {/* ── Move Document Dialog ────────────────────── */}
      <Dialog open={mvD != null} onOpenChange={() => setMvD(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Move Document</DialogTitle></DialogHeader>
          <Button
            variant="outline"
            onClick={() => { moveDoc(mvD!, null); setMvD(null); }}
          >
            <FolderIcon className="w-4 h-4 mr-2" /> Root
          </Button>
          {bucketFolders.map(f => (
            <Button
              key={f.id}
              variant="outline"
              className="mt-2"
              onClick={() => { moveDoc(mvD!, f.id); setMvD(null); }}
            >
              <FolderIcon className="w-4 h-4 mr-2" /> {f.name}
            </Button>
          ))}
        </DialogContent>
      </Dialog>

      {/* ── Delete / Un-publish Confirmation ───────── */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bucket === 0 || confirm?.kind === 'folder'
                ? 'Delete permanently?'
                : 'Un-publish?'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                if (!confirm) return;
                if (confirm.kind === 'folder') {
                  deleteFolder(confirm.id);
                } else {
                  deleteDoc(
                    confirm.id,
                    bucket === 0
                      ? 'general'
                      : scopeFor(bucket)
                  );
                }
                setConfirm(null);
              }}
            >
              Yes
            </Button>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
