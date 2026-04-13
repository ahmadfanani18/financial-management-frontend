'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Wallet, Receipt, Tags, PieChart, Target, Flag, Settings, Bell, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-screen sticky top-0 z-40 transition-all duration-300',
      'bg-gradient-to-b from-background via-background to-background/95',
      'border-r border-border/50 backdrop-blur-xl',
      isCollapsed ? 'w-20' : 'w-64',
      className
    )}>
      <div className={cn('flex items-center h-16 px-4 border-b border-border/50', isCollapsed && 'justify-center px-2')}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
              <span className="text-lg font-bold gradient-text">FinTrack</span>
              <span className="text-[10px] text-muted-foreground -mt-1">Manage your money</span>
            </motion.div>
          )}
        </Link>
        {!isCollapsed && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setIsCollapsed(true)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isCollapsed && (
          <Button variant="ghost" size="icon" className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-lg" onClick={() => setIsCollapsed(false)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
              <Link href={item.href} className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive ? 'bg-gradient-to-r from-primary/10 to-primary-300/5 text-primary shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center px-2'
              )}>
                <div className={cn('flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200', isActive ? 'bg-gradient-primary text-white shadow-md shadow-primary/30' : 'bg-muted group-hover:bg-background')}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && (
                  <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary-300 rounded-r-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className={cn('px-3 py-4 border-t border-border/50 space-y-1', isCollapsed && 'px-2')}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              isCollapsed && 'justify-center px-2'
            )}>
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
