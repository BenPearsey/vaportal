import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout-agent';
import { type BreadcrumbItem } from '@/types';
import { AppHeader } from "@/components/app-header";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
    
        {children}
        <Toaster />
    </AppLayoutTemplate>
);
