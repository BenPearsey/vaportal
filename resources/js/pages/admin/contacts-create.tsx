import { useState } from "react";
import AppLayout from "@/layouts/app-layout-admin";
import { Head, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateContact() {
  const [form, setForm] = useState({
    firstname: "", lastname: "", email: "", phone: "", company: "",
  });

  const save = () => {
    router.post(route("admin.contacts.store"), form, {
      onSuccess: () => {
        toast.success("Contact added");
        router.visit("/admin/contacts");
      },
      onError: () => toast.error("Save failed"),
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title: "Home", href: "/admin/dashboard" },
      { title: "Contacts", href: "/admin/contacts" },
      { title: "Add", href: "/admin/contacts/create" },
    ]}>
      <Head title="Add Contact" />
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader><CardTitle>New Contact</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="First name"
                 value={form.firstname}
                 onChange={e => setForm({ ...form, firstname: e.target.value })}/>
          <Input placeholder="Last name"
                 value={form.lastname}
                 onChange={e => setForm({ ...form, lastname: e.target.value })}/>
          <Input type="email" placeholder="Email"
                 value={form.email}
                 onChange={e => setForm({ ...form, email: e.target.value })}/>
          <Input placeholder="Phone"
                 value={form.phone}
                 onChange={e => setForm({ ...form, phone: e.target.value })}/>
          <Input placeholder="Company"
                 value={form.company}
                 onChange={e => setForm({ ...form, company: e.target.value })}/>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={save}>Save</Button>
            <Button variant="secondary" onClick={() => router.visit("/admin/contacts")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
