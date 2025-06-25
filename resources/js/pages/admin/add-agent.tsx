// resources/js/pages/admin/add-agent.tsx
import { Head, useForm, router, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Agent } from "@/types/agent";

interface FormData {
  prefix: string;
  firstname: string;
  middle: string;
  lastname: string;
  nickname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipcode: string;
  company: string;
  upline_agent_id: string; // "" → Direct
  create_user: boolean;    // create portal user?
}

export default function AddAgent() {
  const { agents = [] } = usePage().props as { agents?: Agent[] };

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    prefix: "",
    firstname: "",
    middle: "",
    lastname: "",
    nickname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipcode: "",
    company: "",
    upline_agent_id: "",
    create_user: true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.agents.store"), {
      onSuccess: () => {
        toast(
          data.create_user
            ? "Agent + portal user created. Temp password e-mailed."
            : "Agent added (no user account)."
        );
        router.visit(route("admin.agents"));
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Add Agent" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {/* ── Name & contact fields ─────────────────────────────── */}
              <div>
                <label className="block mb-1">Prefix</label>
                <Input
                  value={data.prefix}
                  onChange={(e) => setData("prefix", e.target.value)}
                  placeholder="e.g., Mr., Ms., Dr."
                />
                {errors.prefix && (
                  <div className="text-red-500">{errors.prefix[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">First Name</label>
                <Input
                  value={data.firstname}
                  onChange={(e) => setData("firstname", e.target.value)}
                  placeholder="First Name"
                />
                {errors.firstname && (
                  <div className="text-red-500">{errors.firstname[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Middle Name</label>
                <Input
                  value={data.middle}
                  onChange={(e) => setData("middle", e.target.value)}
                  placeholder="Middle Name (optional)"
                />
                {errors.middle && (
                  <div className="text-red-500">{errors.middle[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Last Name</label>
                <Input
                  value={data.lastname}
                  onChange={(e) => setData("lastname", e.target.value)}
                  placeholder="Last Name"
                />
                {errors.lastname && (
                  <div className="text-red-500">{errors.lastname[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Nickname</label>
                <Input
                  value={data.nickname}
                  onChange={(e) => setData("nickname", e.target.value)}
                  placeholder="Nickname (optional)"
                />
                {errors.nickname && (
                  <div className="text-red-500">{errors.nickname[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  placeholder="Email Address"
                />
                {errors.email && (
                  <div className="text-red-500">{errors.email[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <Input
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                  placeholder="Phone Number"
                />
                {errors.phone && (
                  <div className="text-red-500">{errors.phone[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Address</label>
                <Input
                  value={data.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="Street Address"
                />
                {errors.address && (
                  <div className="text-red-500">{errors.address[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">City</label>
                <Input
                  value={data.city}
                  onChange={(e) => setData("city", e.target.value)}
                  placeholder="City"
                />
                {errors.city && (
                  <div className="text-red-500">{errors.city[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Zip Code</label>
                <Input
                  value={data.zipcode}
                  onChange={(e) => setData("zipcode", e.target.value)}
                  placeholder="Zip Code"
                />
                {errors.zipcode && (
                  <div className="text-red-500">{errors.zipcode[0]}</div>
                )}
              </div>
              <div>
                <label className="block mb-1">Company</label>
                <Input
                  value={data.company}
                  onChange={(e) => setData("company", e.target.value)}
                  placeholder="Company Name (optional)"
                />
                {errors.company && (
                  <div className="text-red-500">{errors.company[0]}</div>
                )}
              </div>

              {/* ── Upline selector ─────────────────────────────────── */}
              <div>
                <label className="block mb-1">Upline Agent</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {data.upline_agent_id
                        ? `${agents.find(
                            (a) => a.agent_id === Number(data.upline_agent_id)
                          )?.firstname} ${
                            agents.find(
                              (a) => a.agent_id === Number(data.upline_agent_id)
                            )?.lastname
                          }`
                        : "Direct"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setData("upline_agent_id", "")}>
                      Direct
                    </DropdownMenuItem>
                    {agents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.agent_id}
                        onClick={() =>
                          setData("upline_agent_id", agent.agent_id.toString())
                        }
                      >
                        {agent.firstname} {agent.lastname} (ID:{agent.agent_id})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {errors.upline_agent_id && (
                  <div className="text-red-500">
                    {errors.upline_agent_id[0]}
                  </div>
                )}
              </div>

              {/* ── Create user checkbox ─────────────────────────────── */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={data.create_user}
                  onCheckedChange={(val) => setData("create_user", Boolean(val))}
                  id="create_user"
                />
                <Label htmlFor="create_user">
                  Create portal user &amp; send login email
                </Label>
              </div>

              {/* ── Actions ─────────────────────────────────────────── */}
              <div className="flex gap-4">
                <Button type="submit" disabled={processing}>
                  {processing ? "Creating…" : "Create Agent"}
                </Button>
                <Link href={route("admin.agents")}>
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
