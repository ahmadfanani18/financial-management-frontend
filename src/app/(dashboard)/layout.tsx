'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layouts/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Header } from '@/components/layouts/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <div className="flex min-h-screen bg-background">
      {isAdmin ? <AdminSidebar /> : <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen">
        {!isAdmin && <Header />}
        <main className="flex-1 p-4 lg:p-8 overflow-hidden">
          <div className="mx-auto max-w-7xl h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
