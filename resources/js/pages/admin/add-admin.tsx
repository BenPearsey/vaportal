import { Head, useForm, router, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "sonner";
import { Admin } from "@/types/admin"; // Ensure this type is defined

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
  is_super_admin: boolean;
}

export default function AddAdmin() {
  // No need for upline admin, so we don't retrieve any admin list for that dropdown.
  const { } = usePage().props; // If you need other props, include them here.

  const { data, setData, post, processing, errors } = useForm<FormData>({
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
    is_super_admin: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("admin.admins.store"), {
      onSuccess: () => {
        toast("Admin created successfully! Temporary password sent via email.");
        router.visit(route("admin.admins"));
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Add Admin" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block mb-1">Prefix</label>
                <Input
                  value={data.prefix}
                  onChange={(e) => setData("prefix", e.target.value)}
                  placeholder="e.g., Mr., Ms., Dr."
                />
                {errors.prefix && <div className="text-red-500">{errors.prefix[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">First Name</label>
                <Input
                  value={data.firstname}
                  onChange={(e) => setData("firstname", e.target.value)}
                  placeholder="First Name"
                />
                {errors.firstname && <div className="text-red-500">{errors.firstname[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Middle Name</label>
                <Input
                  value={data.middle}
                  onChange={(e) => setData("middle", e.target.value)}
                  placeholder="Middle Name (optional)"
                />
                {errors.middle && <div className="text-red-500">{errors.middle[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Last Name</label>
                <Input
                  value={data.lastname}
                  onChange={(e) => setData("lastname", e.target.value)}
                  placeholder="Last Name"
                />
                {errors.lastname && <div className="text-red-500">{errors.lastname[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Nickname</label>
                <Input
                  value={data.nickname}
                  onChange={(e) => setData("nickname", e.target.value)}
                  placeholder="Nickname (optional)"
                />
                {errors.nickname && <div className="text-red-500">{errors.nickname[0]}</div>}
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
   <span className="text-red-500 text-sm">
     {errors.email[0]}
   </span>
 )}              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <Input
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                  placeholder="Phone Number"
                />
                {errors.phone && <div className="text-red-500">{errors.phone[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Address</label>
                <Input
                  value={data.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="Street Address"
                />
                {errors.address && <div className="text-red-500">{errors.address[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">City</label>
                <Input
                  value={data.city}
                  onChange={(e) => setData("city", e.target.value)}
                  placeholder="City"
                />
                {errors.city && <div className="text-red-500">{errors.city[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Zip Code</label>
                <Input
                  value={data.zipcode}
                  onChange={(e) => setData("zipcode", e.target.value)}
                  placeholder="Zip Code"
                />
                {errors.zipcode && <div className="text-red-500">{errors.zipcode[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Company</label>
                <Input
                  value={data.company}
                  onChange={(e) => setData("company", e.target.value)}
                  placeholder="Company Name (optional)"
                />
                {errors.company && <div className="text-red-500">{errors.company[0]}</div>}
              </div>
              <div>
                <label className="block mb-1">Super Admin?</label>
                <select
                  value={data.is_super_admin ? "1" : "0"}
                  onChange={(e) => setData("is_super_admin", e.target.value === "1")}
                  className="border rounded p-2 w-full"
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
                {errors.is_super_admin && <div className="text-red-500">{errors.is_super_admin[0]}</div>}
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={processing}>
                  {processing ? "Creating..." : "Create Admin"}
                </Button>
                <Link href={route("admin.admins")}>
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
