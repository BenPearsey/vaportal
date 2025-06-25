import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { BellIcon, BriefcaseBusinessIcon, ChartSplineIcon, FolderIcon, FolderLockIcon, HomeIcon, LayoutGrid, UserPlusIcon, UsersIcon, ShieldIcon, MegaphoneIcon } from 'lucide-react';
import AppLogo from '../app-logo';
import type { NavItem, SharedData } from '@/types';

export function AppSidebar() {
  // Grab shared props (including notifications) for debugging
  const shared = usePage<SharedData>().props;
  console.log('🔔 [AppSidebar] shared props:', shared);

  const { auth, notifications, unreadCount } = shared;

  // Main nav items
  const mainNavItems: NavItem[] = [
    { title: 'Home', url: '/admin/dashboard', icon: HomeIcon },
    { title: 'Sales', url: '/admin/sales', icon: BriefcaseBusinessIcon },
    { title: 'Clients', url: '/admin/clients', icon: UsersIcon },
    { title: 'Agents', url: '/admin/agents', icon: UsersIcon },
    { title: 'Forms & Resources', url: '/admin/forms-resources', icon: FolderIcon },
    { title: 'Broadcasts', url: route('admin.broadcasts.index')   // →  /admin/broadcasts   (GET)
      , icon: MegaphoneIcon },
    { title: 'Add New Client', url: '/admin/clients/create', icon: UserPlusIcon },
    { title: 'Add New Agent', url: '/admin/agents/create', icon: UserPlusIcon },
    { title: 'Reports', url: '/admin/reports', icon: ChartSplineIcon },
  ];

  if (auth.admin?.is_super_admin) {
    mainNavItems.push(
      { title: 'Add New Admin', url: '/admin/admins/create', icon: UserPlusIcon },
      { title: 'Admins', url: '/admin/admins', icon: ShieldIcon },
      { title: 'Admin Documents', url: '/admin/admin-documents', icon: FolderLockIcon },
    );
  }

  // Notifications entry
  mainNavItems.push({
    title: `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
    url: '/admin/notifications',
    icon: BellIcon,
  });

  const footerNavItems: NavItem[] = [];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>


    </Sidebar>
  );
}

export { Sidebar };
