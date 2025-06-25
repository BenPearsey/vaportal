// resources/js/components/app-header.tsx

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { Link, usePage, router } from '@inertiajs/react';
import { BookOpen, Bell, Folder, LayoutGrid, Menu, Search } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import type { BreadcrumbItem, NavItem } from '@/types';
import type { SharedData } from '@/types';

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
];

const rightNavItems: NavItem[] = [
  { title: 'Repository', url: 'https://github.com/laravel/react-starter-kit', icon: Folder },
  { title: 'Documentation', url: 'https://laravel.com/docs/starter-kits', icon: BookOpen },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  // Now TS knows the shape of page.props
  const { auth, notifications, unreadCount } = usePage<SharedData>().props;
  const getInitials = useInitials();

  return (
    <>
      <div className="border-sidebar-border/80 border-b">
        <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex h-full w-64 flex-col justify-between bg-sidebar">
                <SheetHeader className="flex justify-start text-left">
                  <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                </SheetHeader>
                <div className="mt-6 flex flex-1 flex-col justify-between text-sm">
                  <div className="space-y-4">
                    {mainNavItems.map(item => (
                      <Link
                        key={item.title}
                        href={item.url}
                        className="flex items-center space-x-2 font-medium"
                      >
                        {/* assert icon is present */}
                        <Icon iconNode={item.icon!} className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {rightNavItems.map(item => (
                      <a
                        key={item.title}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 font-medium"
                      >
                        <Icon iconNode={item.icon!} className="h-5 w-5" />
                        <span>{item.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/dashboard" prefetch className="flex items-center space-x-2">
            <AppLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
              <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {mainNavItems.map(item => (
                  <NavigationMenuItem key={item.title} className="relative flex h-full items-center">
                    <Link
                      href={item.url}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        page.url === item.url && activeItemStyles,
                        'h-9 px-3'
                      )}
                    >
                      <Icon iconNode={item.icon!} className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                    {page.url === item.url && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white" />
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Search, Links, Notification Bell, User Menu */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Search & External Links */}
            <div className="relative flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-5 w-5 opacity-80" />
              </Button>
              <div className="hidden lg:flex">
                {rightNavItems.map(item => (
                  <TooltipProvider key={item.title} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                        >
                          <Icon iconNode={item.icon!} className="h-5 w-5 opacity-80" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* 🚨 Notifications Bell */}
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
                {notifications.length > 0 ? (
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

            {/* 👤 User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-1 rounded-full">
                  <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                    <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(auth.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <UserMenuContent user={auth.user} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {breadcrumbs.length > 1 && (
        <div className="border-sidebar-border/70 border-b">
          <div className="mx-auto flex h-12 items-center px-4 text-neutral-500 md:max-w-7xl">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>
      )}
    </>
  );
}
