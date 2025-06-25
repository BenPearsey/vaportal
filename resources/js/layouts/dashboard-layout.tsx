import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                {/* ✅ Sidebar on the left */}
                <AppSidebar />

                <div className="flex flex-1 flex-col">
                    {/* ✅ Fix Header Alignment */}
                    <AppHeader />

                    {/* ✅ Fix Main Content Layout */}
                    <main className="flex-1 p-8 overflow-auto">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
