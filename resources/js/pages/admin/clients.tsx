// resources/js/pages/admin/clients.tsx
import { useState } from "react";
import AppLayout from '@/layouts/app-layout-admin';
import { Head, usePage, Link, router } from "@inertiajs/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EyeIcon, TrashIcon, Filter, UserPlus, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { type BreadcrumbItem } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type Client } from "@/types/client"; // Ensure this exists

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home", href: "/admin/dashboard" },
  { title: "Clients", href: "/admin/clients" },
];

export default function AdminClientsPage() {
  const { clients }: { clients: Client[] } = usePage().props as unknown as { clients: Client[] };
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingClientId, setDeletingClientId] = useState<number|null>(null);

  const filteredClients = clients.filter(client =>
    (filterStatus === "All" || client.status === filterStatus) &&
    (client.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
     client.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
     client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const createUserForClient = (clientId: number) => {
    router.post(
      route('admin.clients.makeUser', clientId),
      {},
      {
        onSuccess: () => {
          toast.success('User account created');
          router.reload({ only: ['clients'] });
        },
        onError: () => {
          toast.error('Failed to create user account');
        }
      }
    );
  };

  const confirmDelete = () => {
    if (deletingClientId === null) return;
    router.delete(
      route('admin.clients.destroy', deletingClientId),
      {},
      {
        onSuccess: () => {
          toast.success('Client deleted');
          router.reload({ only: ['clients'] });
        },
        onError: () => {
          toast.error('Failed to delete client');
        }
      }
    );
    setDeletingClientId(null);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Clients" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        {/* Search & Filters */}
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
                  {filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("All")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Prospect")}>Prospect</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("Inactive")}>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href={route("admin.clients.create")}>
              <Button>Add Client</Button>
            </Link>
          </div>
        </div>
        
        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User?</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(client => (
                  <TableRow key={client.client_id}>
                    <TableCell>
                      {client.firstname} {client.lastname}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || "N/A"}</TableCell>
                    <TableCell>{client.status}</TableCell>

                    {/* “User?” column */}
                    <TableCell>
                      {client.user_id ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => createUserForClient(client.client_id)}
                        >
                          <UserPlus className="h-5 w-5" />
                        </Button>
                      )}
                    </TableCell>

                    <TableCell className="flex gap-2">
                      <Link href={route("admin.clients.overview", { client: client.client_id })}>
                        <Button variant="ghost">
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => setDeletingClientId(client.client_id)}
                      >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingClientId !== null} onOpenChange={() => setDeletingClientId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to permanently delete this client?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, delete
            </Button>
            <Button onClick={() => setDeletingClientId(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
