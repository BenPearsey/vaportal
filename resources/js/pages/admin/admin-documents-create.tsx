/* resources/js/pages/admin/admin-documents-create.tsx */
import { Head, useForm, router, Link } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/layouts/app-layout-admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input }  from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home',             href: '/admin/dashboard'          },
  { title: 'Admin Documents',  href: '/admin/admin-documents'    },
  { title: 'Upload',           href: '/admin/admin-documents/create' }
]

export default function AdminDocumentCreate () {
  const { data, setData, post, processing, errors, reset } = useForm<{
    title     : string
    folder_id : string | null
    file      : File | null
  }>({
    title     : '',
    folder_id : null,
    file      : null,
  })

  const submit = (e:React.FormEvent) => {
    e.preventDefault()

    post(route('admin.admin-documents.upload'), {
      forceFormData : true,              // 👈 tells Inertia to send multipart/form-data
      onSuccess () {
        reset()
        router.visit(route('admin.admin-documents'))   // back to listing
      }
    })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Upload document" />

      <div className="p-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader><CardTitle>Upload document</CardTitle></CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title (optional)</label>
                <Input
                  value={data.title}
                  onChange={e => setData('title', e.target.value)}
                  placeholder="Friendly name for the file"
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* you already have a folders table – present a select if you need it */}
              {/* <select … setData('folder_id', v) … /> */}

              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <Input
                  type="file"
                  onChange={e => setData('file', e.target.files?.[0] ?? null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
                {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
              </div>

              <div className="flex gap-4">
                <Button disabled={processing}>
                  {processing ? 'Uploading…' : 'Upload'}
                </Button>

                <Link href={route('admin.admin-documents')}>
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
