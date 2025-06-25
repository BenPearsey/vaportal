// resources/js/pages/admin/agents.tsx
import { useState } from "react";
import AppLayout from "@/layouts/app-layout-admin";
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
import {
  EyeIcon,
  TrashIcon,
  Filter,
  UserPlus,
  CheckCircle,
  ClipboardListIcon,
} from "lucide-react";
import { BreadcrumbItem } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import AgentChecklist from "@/components/AgentChecklist";

interface AgentType {
  agent_id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  user_id?: number | null;
  checklist?: any[]; // ← added
  upline?: {
    agent_id: number;
    firstname: string;
    lastname: string;
  } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Home", href: "/admin/dashboard" },
  { title: "Agents", href: "/admin/agents" },
];

export default function AdminAgentsPage() {
  const { agents }: { agents: AgentType[] } = usePage().props as {
    agents: AgentType[];
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [checkAgent, setCheckAgent] = useState<AgentType | null>(null); // ← added

  const filtered = agents.filter(
    (a) =>
      a.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /* ───── Create user for agent ───── */
  const makeUser = (id: number) => {
    router.post(route("admin.agents.makeUser", id), {}, {
      onSuccess: () => {
        toast.success("Portal user created");
        router.reload({ only: ["agents"] });
      },
      onError: () => toast.error("Failed to create user"),
    });
  };

  /* ───── Delete agent ───── */
  const confirmDelete = () => {
    if (deletingId === null) return;
    router.delete(route("admin.agents.destroy", deletingId), {}, {
      onSuccess: () => {
        toast.success("Agent deleted");
        router.reload({ only: ["agents"] });
      },
      onError: () => toast.error("Failed to delete agent"),
    });
    setDeletingId(null);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Agents" />

      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
        {/* ───── Search / actions bar ───── */}
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
                  <Filter className="mr-2 h-4 w-4" />
                  All
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSearchTerm("")}>
                  All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href={route("admin.agents.create")}>
              <Button>Add&nbsp;Agent</Button>
            </Link>
          </div>
        </div>

        {/* ───── Agents table ───── */}
        <Card>
          <CardHeader>
            <CardTitle>Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>User?</TableHead>
                  <TableHead>Upline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.agent_id}>
                    <TableCell>{a.agent_id}</TableCell>
                    <TableCell>
                      {a.firstname} {a.lastname}
                    </TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.phone ?? "N/A"}</TableCell>

                    {/* user column */}
                    <TableCell>
                      {a.user_id ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button
                          size="icon"
                          variant="outline"
                          title="Create user"
                          onClick={() => makeUser(a.agent_id)}
                        >
                          <UserPlus className="h-5 w-5" />
                        </Button>
                      )}
                    </TableCell>

                    <TableCell>
                      {a.upline
                        ? `${a.upline.firstname} ${a.upline.lastname}`
                        : "Direct"}
                    </TableCell>

                    {/* actions */}
                    <TableCell className="flex gap-2">
                      <Link
                        href={route("admin.agents.overview", {
                          agent: a.agent_id,
                        })}
                      >
                        <Button variant="ghost" title="View">
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        title="Checklist"
                        onClick={() => setCheckAgent(a)} // ← added
                      >
                        <ClipboardListIcon className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        title="Delete"
                        onClick={() => setDeletingId(a.agent_id)}
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

      {/* ───── Delete confirmation dialog ───── */}
      <Dialog
        open={deletingId !== null}
        onOpenChange={() => setDeletingId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to permanently delete this agent?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="destructive" onClick={confirmDelete}>
              Yes, delete
            </Button>
            <Button onClick={() => setDeletingId(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ───── Checklist dialog ───── */}
      <Dialog open={!!checkAgent} onOpenChange={() => setCheckAgent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Checklist — Agent #{checkAgent?.agent_id}
            </DialogTitle>
          </DialogHeader>
          {checkAgent && (
            <AgentChecklist
              agentId={checkAgent.agent_id}
              checklist={checkAgent.checklist ?? []}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
