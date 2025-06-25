import { Head, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout-agent";
import { ArrowLeft, Save } from "lucide-react";

interface EditSaleProps {
    sale: {
        id: number;
        client: string;
        email: string;
        phone: string;
    };
}

export default function EditSale({ sale }: EditSaleProps) {
    const { data, setData, post, processing } = useForm({
        client: sale.client,
        email: sale.email,
        phone: sale.phone,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("agent.sales.update", sale.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Sales", href: route("agent.sales") }, { title: `Edit Sale #${sale.id}`, href: route("agent.sales.edit", sale.id) }]}>
            <Head title={`Edit Sale #${sale.id}`} />

            <div className="flex flex-col gap-4 p-4">
                <Button variant="outline" className="w-max" onClick={() => window.history.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sales
                </Button>

                {/* 📌 Edit Sale Form */}
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader><CardTitle>Edit Sale Details</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Client Name</Label>
                                <Input value={data.client} onChange={(e) => setData("client", e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Phone</Label>
                                <Input type="tel" value={data.phone} onChange={(e) => setData("phone", e.target.value)} required />
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={processing}>
                                {processing ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
