import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { SaleFormData } from "@/types/sale";
import { productOptions }   from "@/lib/products";
import { Agent } from "@/types/agent";
import { Client } from "@/types/client";
import { Carrier } from "@/types/carrier";
import { NumericFormat } from 'react-number-format';


interface AddSaleProps {
  agents: Agent[];
  clients: Client[];
}

export default function AddSale({ agents, clients }: AddSaleProps) {
  // Initialize form data.
  const { data, setData, post, processing, errors, reset } = useForm<SaleFormData>({
    agent_id: "",
    client_id: "",
    product: "",
    carrier: "", // form field for the selected carrier (string)
    total_sale_amount: "",
    commission: "",
    sale_date: "",
    status: "Waiting for Funds",
  });

  // Rename the carriers state variable to avoid confusion.
  const [carrierOptions, setCarrierOptions] = useState<Carrier[]>([]);
  console.log("Initial carrierOptions:", carrierOptions);

  // When data.product changes, fetch the carrier options.
  useEffect(() => {
    if (data.product) {
      axios
        .get(route("admin.sales.carriers"), { params: { product: data.product } })
        .then((response) => {
          console.log("Carrier options response:", response.data);
          const fetchedOptions = Array.isArray(response.data) ? response.data : [];
          setCarrierOptions(fetchedOptions);
          // Reset the form field carrier when new options load.
          setData("carrier", "");
        })
        .catch((error) => {
          console.error("Error fetching carrier options:", error);
          setCarrierOptions([]);
        });
    } else {
      setCarrierOptions([]);
    }
  }, [data.product, setData]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.sales.store"), {
      onSuccess: () => {
        toast("Sale added successfully!");
        reset();
      },
    });
  };

    // sort helpers -------------------------------------------------------------
const sortedAgents  = [...agents].sort(
  (a, b) => a.lastname.localeCompare(b.lastname)
);
const sortedClients = [...clients].sort(
  (a, b) => a.lastname.localeCompare(b.lastname)
);


  return (
    <AppLayout
      breadcrumbs={[
        { title: "Sales", href: "/admin/sales" },
        { title: "Add Sale", href: "/admin/sales/create" },
      ]}
    >
      <Head title="Add Sale" />
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              {/* Agent Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent">Agent</Label>
                  <Select onValueChange={(value) => setData("agent_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Agent" />
                    </SelectTrigger>

<SelectContent>
  {sortedAgents.map((ag) => (
    <SelectItem key={ag.id} value={String(ag.id)}>
      {ag.firstname} {ag.lastname}
    </SelectItem>
  ))}
</SelectContent>

                  </Select>
                  {errors.agent_id && <p className="text-red-500 text-sm">{errors.agent_id}</p>}
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => (window.location.href = "/admin/agents/create")}>
                    + Add New Agent
                  </Button>
                </div>
              </div>

              {/* Client Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select onValueChange={(value) => setData("client_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Client" />
                    </SelectTrigger>
<SelectContent>
  {sortedClients.map((cl) => (
    <SelectItem key={cl.id || cl.client_id} value={String(cl.id || cl.client_id)}>
      {cl.firstname} {cl.lastname}
    </SelectItem>
  ))}
</SelectContent>
                     
                  </Select>
                  {errors.client_id && <p className="text-red-500 text-sm">{errors.client_id}</p>}
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => (window.location.href = "/admin/clients/create")}>
                    + Add New Client
                  </Button>
                </div>
              </div>

              {/* Sale Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select onValueChange={(value) => setData("product", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Product" />
                    </SelectTrigger>
                    <SelectContent>
                         {productOptions.map((p) => (
     <SelectItem key={p.slug} value={p.slug}>
       {p.label}
    </SelectItem>
   ))}
                    </SelectContent>
                  </Select>
                  {errors.product && <p className="text-red-500 text-sm">{errors.product}</p>}
                </div>
                <div>
                  <Label htmlFor="carrier">Carrier</Label>
                  <Select onValueChange={(value) => setData("carrier", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(carrierOptions) && carrierOptions.length > 0 ? (
                        carrierOptions.map((carrier) => (
                          <SelectItem key={carrier.id} value={String(carrier.id)}>
                            {carrier.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No carriers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.carrier && <p className="text-red-500 text-sm">{errors.carrier}</p>}
                </div>
                <div>
                  <Label>Total Sale Amount</Label>
<NumericFormat
  thousandSeparator
  prefix="$"
  decimalScale={2}
  fixedDecimalScale
  allowNegative={false}
  value={data.total_sale_amount}
  // floatValue = unformatted  (e.g. 200000)
  onValueChange={(v) => setData('total_sale_amount', v.floatValue ?? '')}
  className="w-full border rounded px-3 py-2"
/>

<Label>Commission</Label>
<NumericFormat
  thousandSeparator
  prefix="$"
  decimalScale={2}
  fixedDecimalScale
  allowNegative={false}
  value={data.commission}
  onValueChange={(v) => setData('commission', v.floatValue ?? '')}
  className="w-full border rounded px-3 py-2"
/>
                </div>
                <div>
                  <Label htmlFor="sale_date">Sale Date</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    value={data.sale_date}
                    onChange={(e) => setData("sale_date", e.target.value)}
                  />
                  {errors.sale_date && <p className="text-red-500 text-sm">{errors.sale_date}</p>}
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value) => setData("status", value as SaleFormData["status"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Waiting for Funds">Waiting for Funds</SelectItem>
                    <SelectItem value="Waiting for Documents">Waiting for Documents</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Waiting for Carrier">Waiting for Carrier</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
              </div>

              <Button type="submit" disabled={processing} className="w-full mt-4">
                {processing ? "Saving..." : "Save Sale"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
