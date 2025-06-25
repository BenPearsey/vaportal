// resources/js/pages/admin/admins.tsx
import { useState } from "react";
import AppLayout from '@/layouts/app-layout-admin';
import { Head, usePage, Link } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EyeIcon, TrashIcon, Filter } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Admin } from "@/types/admin"; // Define this type based on your admin model

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home", href: "/admin/dashboard" },
  { title: "Admins", href: "/admin/admins" },
];

export default function AdminsPage() {
  const { admins } = usePage().props as { admins: Admin[] };
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredAdmins = admins.filter(admin =>
    admin.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admins" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        {/* Search, Filters, and Add Admin Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            placeholder="Search by name or email"
            className="w-full md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSearchTerm("")}>
                  All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href={route("admin.admins.create")}>
              <Button>
                Add Admin
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Super Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.admin_id}>
                    <TableCell>{admin.admin_id}</TableCell>
                    <TableCell>{admin.firstname} {admin.lastname}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone || "N/A"}</TableCell>
                    <TableCell>{admin.is_super_admin ? "Yes" : "No"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Link href={route("admin.admins.overview", { admin: admin.admin_id })}>
                        <Button variant="ghost">
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        </Button>
                      </Link>
                      <Button variant="ghost">
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
