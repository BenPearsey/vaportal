import { usePage } from '@inertiajs/react';
import type { SharedData, NavItem } from '@/types';
import { BellIcon, BriefcaseBusinessIcon, HomeIcon, FolderIcon, User } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import AppLogo from '../app-logo';

export function AppSidebar() {
  // pull unreadCount out of your shared Inertia props
  const { unreadCount } = usePage<SharedData>().props;

  // build main nav, then append notifications
  const mainNavItems: NavItem[] = [
    { title: 'Home', url: '/agent/dashboard', icon: HomeIcon },
    { title: 'Sales', url: '/agent/sales', icon: BriefcaseBusinessIcon },
    { title: 'Clients', url: '/agent/clients', icon: User },
    { title: 'Forms & Resources', url: '/agent/forms-resources', icon: FolderIcon },

    {
      title: `Notifications${unreadCount ? ` (${unreadCount})` : ''}`,
      url: '/agent/notifications',
      icon: BellIcon,
    },
  ];

  const footerNavItems: NavItem[] = [
    { title: 'Documents', url: '#', icon: FolderIcon },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/agent/dashboard" prefetch><AppLogo /></Link>
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
