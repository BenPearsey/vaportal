// resources/js/layouts/app-sidebar-layout-agent.tsx
import React from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/agent/app-sidebar';
import { AppSidebarHeader } from '@/components/agent/app-sidebar-header';
import type { BreadcrumbItem } from '@/types';

interface Props {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayoutAgent({ children, breadcrumbs = [] }: Props) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </AppContent>
    </AppShell>
  );
}
