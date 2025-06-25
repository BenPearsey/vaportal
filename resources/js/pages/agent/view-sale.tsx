import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout-agent";
import { ArrowLeft } from "lucide-react";

interface SaleProps {
    sale: {
        id: number;
        client: string;
        email: string;
        phone: string;
        product: string;
        amount: number;
        status: string;
        date: string;
    };
}

export default function ViewSale({ sale }: SaleProps) {
    return (
        <AppLayout breadcrumbs={[{ title: "Sales", href: route("agent.sales") }, { title: `View Sale #${sale.id}`, href: route("agent.sales.view", sale.id) }]}>
            <Head title={`Sale #${sale.id}`} />

            <div className="flex flex-col gap-4 p-4">
                <Button variant="outline" className="w-max" onClick={() => window.history.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sales
                </Button>

                {/* 📌 Sale Details */}
                <Card>
                    <CardHeader><CardTitle>Sale Details</CardTitle></CardHeader>
                    <CardContent className="grid gap-4">
                        <p><strong>Client Name:</strong> {sale.client}</p>
                        <p><strong>Email:</strong> {sale.email}</p>
                        <p><strong>Phone:</strong> {sale.phone}</p>
                        <p><strong>Product:</strong> {sale.product}</p>
                        <p><strong>Amount:</strong> ${sale.amount.toLocaleString()}</p>
                        <p><strong>Status:</strong> {sale.status}</p>
                        <p><strong>Date:</strong> {sale.date}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
