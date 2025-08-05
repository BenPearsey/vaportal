// resources/js/components/admin/app-sidebar-header.tsx
import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useAuth } from '@/hooks/use-auth';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Bell, LogOut } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType, SharedData } from '@/types';

interface Props {
  breadcrumbs?: BreadcrumbItemType[];
}

export function AppSidebarHeader({ breadcrumbs = [] }: Props) {
  /* ───────── shared props ───────── */
  const { notifications, unreadCount, auth } = usePage<SharedData>().props;
  const roles: string[] = auth.roles ?? []; // ← array of 'admin'|'agent'|'client'

  const { user, firstName, lastName } = useAuth();
  const cleanup = useMobileNavigation();

  return (
    <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 md:px-4">
      {/* left: burger + crumbs */}
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      {/* 🔔 Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuItem className="flex justify-between px-4 py-2">
            <span className="font-semibold">Notifications</span>
            <button
              onClick={() => router.post(route('notifications.readAll'))}
              className="text-sm text-primary hover:underline"
            >
              Mark all read
            </button>
          </DropdownMenuItem>

          {notifications.length ? (
            notifications.map(n => (
              <DropdownMenuItem
                key={n.id}
                className="flex items-start justify-between px-4 py-2 hover:bg-gray-100"
              >
                <Link
                  href={n.data.url ?? '#'}
                  className="flex-1 text-sm text-gray-800 hover:text-primary"
                >
                  <div>{n.data.message}</div>
                  <div className="text-xs text-gray-500">{n.created}</div>
                </Link>
                <button
                  onClick={() => router.post(route('notifications.read', n.id))}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="px-4 py-2 text-center text-gray-500">
              No new notifications
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 👤 Avatar menu  +  (optional) role switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarImage src={user?.avatar} alt={`${firstName} ${lastName}`} />
            <AvatarFallback>
              {firstName?.charAt(0)}
              {lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {/* Role switcher – only if user has >1 roles */}
          {roles.length > 1 && (
            <>
              <DropdownMenuItem disabled className="opacity-70">
                Switch role
              </DropdownMenuItem>
              {roles.map(role => (
                <DropdownMenuItem
                  key={role}
                  onClick={() =>
                    router.post(
                      route('role.switch'),
                      { role },                       // body
                      { onFinish: () => (window.location.href = '/') }, // reload @ /
                    )
                  }
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Profile / logout */}
          <DropdownMenuItem asChild>
            <Link href="/admin/settings/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              className="block w-full"
              method="post"
              href={route('logout')}
              as="button"
              onClick={cleanup}
            >
              <LogOut className="mr-2" />
              Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
