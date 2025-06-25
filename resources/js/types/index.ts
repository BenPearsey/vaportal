import { LucideIcon } from 'lucide-react';

export interface NotificationData {
  id: string;
  type: string;
  data: {
    message: string;
    url?: string;
  };
  read_at: string | null;
  created: string; // e.g. "2 hours ago"
}

export interface Auth {
  user: User;
  admin?: unknown; // if you use an admin relationship, narrow this type
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;

  // new notification props:
  notifications: NotificationData[];
  unreadCount: number;

  // allow other shared props
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: string;
}
