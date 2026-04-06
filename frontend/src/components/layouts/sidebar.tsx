'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Wallet, Receipt, Tags, PieChart, Target, Flag, Settings, Bell } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/accounts', label: 'Akun', icon: Wallet },
  { href: '/dashboard/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/dashboard/categories', label: 'Kategori', icon: Tags },
  { href: '/dashboard/budgets', label: 'Budget', icon: PieChart },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/plans', label: 'Plans', icon: Flag },
  { href: '/dashboard/reports', label: 'Laporan', icon: PieChart },
];

const bottomNavItems = [
  { href: '/dashboard/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold">Finansial</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
