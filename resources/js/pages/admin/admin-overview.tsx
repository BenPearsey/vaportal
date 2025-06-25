/* admin » Admin overview & super-admin toggle */
import { Head, Link, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";      // shadcn switch

export default function AdminOverview() {
  const { admin } = usePage().props as {
    admin: {
      admin_id: number;
      firstname: string;
      lastname: string;
      email: string;
      phone?: string;
      is_super_admin: boolean;
    };
  };

  const flip = () =>
    router.put(
      route("admin.admins.toggleSuper", { admin: admin.admin_id }),
      {},
      { preserveScroll: true }
    );

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Admins", href: route("admin.admins") },
        { title: `${admin.firstname} ${admin.lastname}`, href: "#" },
      ]}
    >
      <Head title="Admin overview" />
      <Card>
        <CardHeader>
          <CardTitle>
            {admin.firstname} {admin.lastname}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p>
            <strong>Email:</strong> {admin.email}
          </p>
          <p>
            <strong>Phone:</strong> {admin.phone ?? "—"}
          </p>

          <div className="flex items-center gap-4">
            <span className="font-medium">Super admin</span>
            <Switch
              checked={admin.is_super_admin}
              onCheckedChange={flip}
            />
          </div>

          <Link href={route("admin.admins")}>
            <Button variant="outline">← Back to list</Button>
          </Link>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
