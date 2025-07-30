import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Contact } from "@/types/contact";

/** Two-column grid layout identical to ContactsCreate */
export default function ContactsEdit() {
  const { contact } = usePage().props as { contact: Contact };

  const { data, setData, put, processing, errors } = useForm<Contact>({
    prefix:    contact.prefix    ?? "",
    firstname: contact.firstname ?? "",
    middle:    contact.middle    ?? "",
    lastname:  contact.lastname  ?? "",
    email:     contact.email     ?? "",
    phone:     contact.phone     ?? "",
    company:   contact.company   ?? "",
    address:   contact.address   ?? "",
    city:      contact.city      ?? "",
    zipcode:   contact.zipcode   ?? "",
    notes:     contact.notes     ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route("admin.contacts.update", contact.id), {
      onSuccess: () => {
        toast.success("Contact updated");
        router.visit(route("admin.contacts.show", contact.id));
      },
      onError: () => toast.error("Update failed"),
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title: "Home",      href: "/admin/dashboard" },
      { title: "Contacts",  href: "/admin/contacts" },
      { title: `${contact.firstname} ${contact.lastname}`, href: route("admin.contacts.show", contact.id) },
      { title: "Edit", href: "#" },
    ]}>
      <Head title="Edit contact" />

      <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6 p-6">
        <Card>
          <CardHeader><CardTitle>Edit contact</CardTitle></CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Prefix"
              value={data.prefix}
              onChange={e => setData("prefix", e.target.value)}
              error={errors.prefix}
            />
            <Input
              placeholder="First name"
              value={data.firstname}
              onChange={e => setData("firstname", e.target.value)}
              error={errors.firstname}
              required
            />
            <Input
              placeholder="Middle"
              value={data.middle}
              onChange={e => setData("middle", e.target.value)}
              error={errors.middle}
            />
            <Input
              placeholder="Last name"
              value={data.lastname}
              onChange={e => setData("lastname", e.target.value)}
              error={errors.lastname}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={data.email}
              onChange={e => setData("email", e.target.value)}
              error={errors.email}
              required
            />
            <Input
              placeholder="Phone"
              value={data.phone}
              onChange={e => setData("phone", e.target.value)}
              error={errors.phone}
            />
            <Input
              placeholder="Company"
              value={data.company}
              onChange={e => setData("company", e.target.value)}
              error={errors.company}
            />
            <Input
              placeholder="Address"
              value={data.address}
              onChange={e => setData("address", e.target.value)}
              error={errors.address}
            />
            <Input
              placeholder="City"
              value={data.city}
              onChange={e => setData("city", e.target.value)}
              error={errors.city}
            />
            <Input
              placeholder="Zip / Postcode"
              value={data.zipcode}
              onChange={e => setData("zipcode", e.target.value)}
              error={errors.zipcode}
            />

            {/* Notes spans full width */}
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium">Notes</label>
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={4}
                value={data.notes}
                onChange={e => setData("notes", e.target.value)}
              />
              {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href={route("admin.contacts.show", contact.id)}>
            <Button type="button" variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" disabled={processing}>Save</Button>
        </div>
      </form>
    </AppLayout>
  );
}
