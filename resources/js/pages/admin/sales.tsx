// resources/js/pages/admin/sales.tsx
/* eslint-disable react/jsx-no-bind */
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
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
  EyeIcon,
  TrashIcon,
  ClipboardListIcon,
  Filter,
  CheckSquare,
  Download,
  FilePlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout-admin";
import { BreadcrumbItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { productOptions, productLabel } from "@/lib/products";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import  SaleChecklist  from "@/components/SaleChecklist";


interface Sale {
  sale_id: number;
  agent: any;
  client: any;
  product: string;
  total_sale_amount: number;
  commission: number;
  status: string;
  sale_date: string;
  carrier_info?: { name: string };
}

interface AdminSalesPageProps {
  sales: Sale[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home", href: "/admin/dashboard" },
  { title: "Sales", href: "/admin/sales" },
];



const statusOptions = [
  "Waiting for Funds",
  "Waiting for Documents",
  "Processing",
  "Waiting for Carrier",
  "Completed",
  "Cancelled",
];

export default function AdminSalesPage({ sales: initial }: AdminSalesPageProps) {
  const [sales, setSales] = useState(initial);
  const [selected, setSelected] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);



  /* ───── helpers ───── */
  const toggleRow = (id: number) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );

  const changeStatus = (newStatus: string) => {
    setSales((prev) =>
      prev.map((s) =>
        selected.includes(s.sale_id) ? { ...s, status: newStatus } : s
      )
    );
    setSelected([]);
  };

  const exportCSV = () => {
    const csv =
      "Sale ID,Agent,Client,Email,Phone,Carrier,Sale Type,Total Sale,Commission,Status,Sale Date\n" +
      sales
        .map((s) => {
          const agent =
            s.agent && typeof s.agent === "object"
              ? `${s.agent.firstname} ${s.agent.lastname}`
              : "N/A";
          const client =
            s.client && typeof s.client === "object"
              ? `${s.client.firstname} ${s.client.lastname}`
              : "N/A";
          const email = s.client?.email ?? "N/A";
          const phone = s.client?.phone ?? "N/A";
          return [
            s.sale_id,
            agent,
            client,
            email,
            phone,
            s.carrier_info?.name ?? "N/A",
            productLabel(s.product),
            s.total_sale_amount,
            s.commission,
            s.status,
            s.sale_date,
          ].join(",");
        })
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSales = sales.filter((s) => {
    const lower = search.toLowerCase();
    const matchesSearch =
      `${s.client?.firstname ?? ""} ${s.client?.lastname ?? ""}`
        .toLowerCase()
        .includes(lower) ||
      `${s.agent?.firstname ?? ""} ${s.agent?.lastname ?? ""}`
        .toLowerCase()
        .includes(lower) ||
      (s.client?.email ?? "").toLowerCase().includes(lower);
    const matchesStatus = filterStatus === "All" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const [checklistSale, setChecklistSale] = useState<Sale|null>(null);


  /* ───── delete sale ───── */
  const confirmDelete = () => {
    if (deletingId === null) return;
    router.delete(route("admin.sales.destroy", deletingId), {}, {
      onSuccess: () => {
        toast.success("Sale deleted");
        router.reload({ only: ["sales"] });
      },
      onError: () => toast.error("Failed to delete sale"),
    });
    setDeletingId(null);
  };


  
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sales" />

      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        {/* ───── top bar ───── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Input
            placeholder="Search by client, agent, or email"
            className="w-full md:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("All")}>
                  All
                </DropdownMenuItem>
                {statusOptions.map((st) => (
                  <DropdownMenuItem key={st} onClick={() => setFilterStatus(st)}>
                    {st}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" disabled={!selected.length}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {statusOptions.map((st) => (
                  <DropdownMenuItem key={st} onClick={() => changeStatus(st)}>
                    {st}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>

            <Button
              variant="default"
              onClick={() => (window.location.href = "/admin/sales/create")}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </div>
        </div>

        {/* ───── table ───── */}
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selected.length === sales.length && sales.length}
                      onCheckedChange={() =>
                        setSelected(
                          selected.length === sales.length
                            ? []
                            : sales.map((s) => s.sale_id)
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Sale&nbsp;ID</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Sale&nbsp;Type</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSales.map((s) => (
                  <TableRow key={s.sale_id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(s.sale_id)}
                        onCheckedChange={() => toggleRow(s.sale_id)}
                      />
                    </TableCell>
                    <TableCell>{s.sale_id}</TableCell>

                    <TableCell>
                      {s.agent && typeof s.agent === "object"
                        ? `${s.agent.firstname} ${s.agent.lastname}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {s.client && typeof s.client === "object"
                        ? `${s.client.firstname} ${s.client.lastname}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{s.client?.email ?? "N/A"}</TableCell>
                    <TableCell>{s.client?.phone ?? "N/A"}</TableCell>
                    <TableCell>{s.carrier_info?.name ?? "N/A"}</TableCell>
                    <TableCell>{productLabel(s.product)}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(s.total_sale_amount))}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(s.commission))}
                    </TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.sale_date}</TableCell>

                    <TableCell className="flex gap-2">
                      <Link
                        href={route("admin.sales.show", s.sale_id)}
                        title="View"
                      >
                        <Button variant="ghost">
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        </Button>
                      </Link>

{/* in the Actions column */}
<Button
  variant="ghost"
  title="Checklist"
  onClick={() => setChecklistSale(s)}   // new state
>
  <ClipboardListIcon className="h-5 w-5 text-gray-500" />
</Button>


                      <Button
                        variant="ghost"
                        title="Delete"
                        onClick={() => setDeletingId(s.sale_id)}
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

      {/* ───── Delete dialog ───── */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={() => setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sale?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to permanently delete this sale?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, delete
            </Button>
            <Button onClick={() => setDeletingId(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!checklistSale} onOpenChange={() => setChecklistSale(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Checklist – Sale #{checklistSale?.sale_id}</DialogTitle>
    </DialogHeader>
    {checklistSale && (
      <SaleChecklist saleId={checklistSale.sale_id} checklist={checklistSale.checklist} />
    )}
  </DialogContent>
</Dialog>
    </AppLayout>
  );
}
