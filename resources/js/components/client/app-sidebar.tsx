import { usePage } from '@inertiajs/react';
import type { SharedData, NavItem } from '@/types';
import { BellIcon, LayoutGrid as FolderIcon, BookOpen, HomeIcon, Folder } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import AppLogo from '../app-logo';

export function AppSidebar() {
  // grab unreadCount
  const { unreadCount } = usePage<SharedData>().props;

  const mainNavItems: NavItem[] = [
    { title: 'Home', url: '/client/dashboard', icon: HomeIcon },
    { title: 'Forms & Resources', url: '/client/forms-resources', icon: Folder },

    {
      title: `Notifications${unreadCount ? ` (${unreadCount})` : ''}`,
      url: '/client/notifications',
      icon: BellIcon,
    },
  ];

  const footerNavItems: NavItem[] = [
    { title: 'Repository', url: 'https://github.com/laravel/react-starter-kit', icon: FolderIcon },
    { title: 'Documentation', url: 'https://laravel.com/docs/starter-kits', icon: BookOpen },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/client/dashboard" prefetch><AppLogo /></Link>
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
