import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Folder as FolderIcon,
  FileText as FileIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Folder {
  id: number;
  name: string;
  children: Folder[];
  documents: Doc[];
}
interface Doc {
  id: number;
  title: string;
}

interface Props {
  folders: Folder[];
  generalDocs: Doc[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Forms & Resources', href: route('client.forms-resources') },
];

export default function ClientFormsResources() {
  const { folders, generalDocs } = usePage<Props>().props;

  /** build a synthetic root so we can reuse the exact same drill-down
   *  experience the agent view has */
  const root: Folder = {
    id: 0,
    name: 'Root',
    children: folders,
    documents: generalDocs,
  };

  const [path, setPath] = useState<Folder[]>([root]);
  const current = path[path.length - 1];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Forms & Resources" />

      <Card className="flex flex-col h-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Forms&nbsp;&amp;&nbsp;Resources</CardTitle>
            {/* in-folder breadcrumb */}
            <div className="mt-2 text-sm text-muted-foreground">
              {path.map((node, i) => (
                <React.Fragment key={node.id}>
                  {i > 0 && <span> / </span>}
                  <span>{node.name}</span>
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

        <CardContent className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Folders */}
            {current.children.map(folder => (
              <div
                key={folder.id}
                onClick={() => setPath(p => [...p, folder])}
                className="border p-4 rounded flex flex-col items-center hover:bg-muted cursor-pointer"
              >
                <FolderIcon className="h-8 w-8 text-primary" />
                <span className="mt-2 truncate">{folder.name}</span>
              </div>
            ))}

            {/* Documents */}
            {current.documents.map(doc => {
              const url = route('client.forms-resources.show', doc.id);
              return (
                <div
                  key={doc.id}
                  className="border p-4 rounded flex flex-col items-center hover:bg-muted"
                >
                  <span className="text-sm mb-1 truncate">{doc.title}</span>
                  <FileIcon className="h-8 w-8 text-primary mb-2" />

                  <div className="flex space-x-2">
{/* View (opens inline) */}
<Button variant="ghost" size="icon" asChild>
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
  >
    <EyeIcon className="h-5 w-5" />
  </a>
</Button>


                    <Button variant="ghost" size="icon" asChild>
                      <a href={url} download>
                        <DownloadIcon className="h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Empty folder fallback */}
            {current.children.length === 0 &&
              current.documents.length === 0 && (
                <p className="col-span-full text-center text-gray-500">
                  There’s nothing here.
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
