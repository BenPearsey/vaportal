import { Head, useForm, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout-admin";
import { type Agent } from "@/types/agent"; // Importing Agent type

export default function AddClient() {
  const { agents } = usePage().props as unknown as { agents: Agent[] };

  const { data, setData, post, processing, errors, reset } = useForm({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    dob: "",
    status: "Prospect",
    agent_id: "",        // Default to “no agent”
    create_user: false,  // ← NEW: whether to also create a user account
    bank_name:      "",
    account_type:   "",
    account_holder: "",
    routing_number: "",
    account_number: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.clients.store"), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Clients", href: "/admin/clients" },
        { title: "Add Client", href: "/admin/clients/create" },
      ]}
    >
      <Head title="Add Client" />
      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Label>First Name</Label>
            <Input
              value={data.firstname}
              onChange={(e) => setData("firstname", e.target.value)}
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm">{errors.firstname}</p>
            )}

            <Label>Last Name</Label>
            <Input
              value={data.lastname}
              onChange={(e) => setData("lastname", e.target.value)}
            />
            {errors.lastname && (
              <p className="text-red-500 text-sm">{errors.lastname}</p>
            )}

            <Label>Email</Label>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <Label>Phone</Label>
            <Input
              type="tel"
              value={data.phone}
              onChange={(e) => setData("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}

            <Label>Address</Label>
            <Input
              value={data.address}
              onChange={(e) => setData("address", e.target.value)}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}

            <Label>City</Label>
            <Input
              value={data.city}
              onChange={(e) => setData("city", e.target.value)}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}

            <Label>State</Label>
            <Input
              value={data.state}
              onChange={(e) => setData("state", e.target.value)}
            />
            {errors.state && (
              <p className="text-red-500 text-sm">{errors.state}</p>
            )}

            <Label>Zip Code</Label>
            <Input
              value={data.zipcode}
              onChange={(e) => setData("zipcode", e.target.value)}
            />
            {errors.zipcode && (
              <p className="text-red-500 text-sm">{errors.zipcode}</p>
            )}

            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={data.dob}
              onChange={(e) => setData("dob", e.target.value)}
            />
            {errors.dob && (
              <p className="text-red-500 text-sm">{errors.dob}</p>
            )}

            <Label>Status</Label>
            <Select
              value={data.status}
              onValueChange={(value) => setData("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prospect">Prospect</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status}</p>
            )}

            <Label>Agent (Optional)</Label>
            <Select
              value={data.agent_id || "null"}
              onValueChange={(value) =>
                setData("agent_id", value === "null" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">No Agent</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.firstname} {agent.lastname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.agent_id && (
              <p className="text-red-500 text-sm">{errors.agent_id}</p>
            )}

            {/* ─── Banking Details ─────────────────────────── */}
<div className="pt-4 border-t">
  <h4 className="font-semibold mb-2">Banking Details (optional)</h4>

  <Label>Bank Name</Label>
  <Input
    value={data.bank_name}
    onChange={e => setData("bank_name", e.target.value)}
  />
  {errors.bank_name && (
    <p className="text-red-500 text-sm">{errors.bank_name}</p>
  )}

  <Label>Account Type</Label>
  <Select
    value={data.account_type}
    onValueChange={val => setData("account_type", val)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Account Type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Checking">Checking</SelectItem>
      <SelectItem value="Savings">Savings</SelectItem>
      <SelectItem value="Other">Other</SelectItem>
    </SelectContent>
  </Select>
  {errors.account_type && (
    <p className="text-red-500 text-sm">{errors.account_type}</p>
  )}

  <Label>Account Holder</Label>
  <Input
    value={data.account_holder}
    onChange={e => setData("account_holder", e.target.value)}
  />
  {errors.account_holder && (
    <p className="text-red-500 text-sm">{errors.account_holder}</p>
  )}

  <Label>Routing #</Label>
  <Input
    value={data.routing_number}
    onChange={e => setData("routing_number", e.target.value)}
  />
  {errors.routing_number && (
    <p className="text-red-500 text-sm">{errors.routing_number}</p>
  )}

  <Label>Account #</Label>
  <Input
    value={data.account_number}
    onChange={e => setData("account_number", e.target.value)}
  />
  {errors.account_number && (
    <p className="text-red-500 text-sm">{errors.account_number}</p>
  )}
</div>


            {/* ← NEW FIELD */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={data.create_user}
                onCheckedChange={(val) => setData("create_user", val)}
              />
              <Label>Create user account?</Label>
            </div>

            <Button type="submit" disabled={processing} className="w-full mt-4">
              {processing ? "Saving..." : "Save Client"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
