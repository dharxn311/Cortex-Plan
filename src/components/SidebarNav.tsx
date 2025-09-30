import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookCopy, BookMarked, CalendarDays, BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/subjects', icon: BookCopy, label: 'Subjects' },
  { to: '/exams', icon: BookMarked, label: 'Exams' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
];
export function SidebarNav() {
  return (
    <div className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <BookOpenCheck className="h-6 w-6 text-sky-500" />
            <span>Cortex Plan</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
            <div className="text-xs text-muted-foreground text-center">
                Built with ��️ at Cloudflare
            </div>
        </div>
      </div>
    </div>
  );
}