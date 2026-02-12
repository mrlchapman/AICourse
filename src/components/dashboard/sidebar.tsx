'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { signOut } from '@/app/actions/auth';

interface SidebarProps {
  user: {
    display_name: string | null;
    email: string | null;
    role: string;
  } | null;
}

const teacherNav = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Courses', href: '/courses', icon: FolderOpen },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const studentNav = [
  { label: 'My Courses', href: '/my-courses', icon: GraduationCap },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const navItems = user?.role === 'student' ? studentNav : teacherNav;

  return (
    <aside
      className={cn(
        'h-screen bg-surface border-r border-border flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <BookOpen className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-2.5 font-semibold text-foreground whitespace-nowrap">
            Course Creator
          </span>
        )}
      </div>

      {/* New Course Button (teachers only) */}
      {user?.role !== 'student' && (
        <div className="p-3">
          <Link
            href="/courses?new=true"
            className={cn(
              'flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary-hover',
              collapsed ? 'h-9 w-9 justify-center' : 'h-9 px-3 text-sm'
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>New Course</span>}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 h-9 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-2 flex items-center justify-center h-8 rounded-lg text-foreground-subtle hover:bg-surface-hover transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={user?.display_name}
            email={user?.email}
            size="sm"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.display_name || 'User'}
              </p>
              <p className="text-xs text-foreground-subtle truncate">
                {user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-md text-foreground-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
