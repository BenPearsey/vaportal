import React, { useState, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout-agent'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import axios from 'axios'
import { toast } from 'sonner'
import { SaleFormData } from '@/types/sale'
import { Client } from '@/types/client'

interface AddSaleProps {
  clients: Client[]
  products: string[]
  statuses: string[]
}

export default function AddSale({ clients, products, statuses }: AddSaleProps) {
  const { data, setData, post, processing, errors, reset } =
    useForm<SaleFormData>({
      client_id: '',
      product: '',
      carrier: '',
      total_sale_amount: '',
      commission: '',
      sale_date: '',
      status: statuses[0] || '',
    })

  const [carrierOptions, setCarrierOptions] = useState<
    { id: number; name: string }[]
  >([])

  // Whenever product changes, re-fetch its carriers
  useEffect(() => {
    if (!data.product) {
      setCarrierOptions([])
      setData('carrier', '')
      return
    }
    axios
      .get(route('agent.sales.carriers'), { params: { product: data.product } })
      .then((res) => {
        setCarrierOptions(res.data || [])
        setData('carrier', '')
      })
      .catch(() => {
        setCarrierOptions([])
      })
  }, [data.product])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post(route('agent.sales.store'), {
      onSuccess: () => {
        toast.success('Sale created and admins notified.')
        reset()
      },
      onError: () => {
        toast.error('Couldn’t create the sale.')
      },
    })
  }

  // helper to turn "precious_metals" → "Precious Metals"
  const humanize = (str: string) =>
    str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Sales', href: route('agent.sales') },
        { title: 'Add Sale', href: '' },
      ]}
    >
      <Head title="Add New Sale" />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {/* Client + “Add New Client” */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Client</Label>
                  <Select onValueChange={(v) => setData('client_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem
                          key={`client-${c.id}`}
                          value={String(c.id)}
                        >
                          {c.firstname} {c.lastname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && (
                    <p className="text-red-500 text-sm">
                      {errors.client_id}
                    </p>
                  )}
                </div>
                <Button
                type="button"
                  variant="outline"
                  onClick={() => router.get(route('agent.clients.create'))}
                >
                  + Add New Client
                </Button>
              </div>

              {/* Product */}
              <div>
                <Label>Product</Label>
                <Select onValueChange={(v) => setData('product', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={`prod-${p}`} value={p}>
                        {humanize(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.product && (
                  <p className="text-red-500 text-sm">{errors.product}</p>
                )}
              </div>

              {/* Carrier */}
              <div>
                <Label>Carrier</Label>
                <Select onValueChange={(v) => setData('carrier', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carrierOptions.length > 0 ? (
                      carrierOptions.map((c) => (
                        <SelectItem
                          key={`carr-${c.id}`}
                          value={String(c.id)}
                        >
                          {c.name}
                        </SelectItem>
                      ))
                    ) : (
                        <SelectItem key="no-carriers" value="no-carriers" disabled>
                        No carriers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.carrier && (
                  <p className="text-red-500 text-sm">{errors.carrier}</p>
                )}
              </div>

              {/* Amounts & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Sale Amount</Label>
                  <Input
                    type="number"
                    value={data.total_sale_amount}
                    onChange={(e) =>
                      setData('total_sale_amount', e.target.value)
                    }
                  />
                  {errors.total_sale_amount && (
                    <p className="text-red-500 text-sm">
                      {errors.total_sale_amount}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Commission</Label>
                  <Input
                    type="number"
                    value={data.commission}
                    onChange={(e) => setData('commission', e.target.value)}
                  />
                  {errors.commission && (
                    <p className="text-red-500 text-sm">
                      {errors.commission}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Sale Date</Label>
                  <Input
                    type="date"
                    value={data.sale_date}
                    onChange={(e) => setData('sale_date', e.target.value)}
                  />
                  {errors.sale_date && (
                    <p className="text-red-500 text-sm">
                      {errors.sale_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select onValueChange={(v) => setData('status', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={`stat-${s}`} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status}</p>
                )}
              </div>

              <Button type="submit" disabled={processing} className="w-full">
                {processing ? 'Saving…' : 'Save Sale'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
