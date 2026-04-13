'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { accountService } from '@/services/account.service';
import { categoryService } from '@/services/category.service';
import { transactionService } from '@/services/transaction.service';
import { SummaryCards } from '@/components/features/dashboard/summary-cards';
import { RecentTransactions } from '@/components/features/dashboard/recent-transactions';
import { SpendingChart } from '@/components/features/dashboard/spending-chart';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Calendar, Download } from 'lucide-react';
import { PageTransition } from '@/components/ui/motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data: totalBalance = 0 } = useQuery({ queryKey: ['totalBalance'], queryFn: () => accountService.getTotalBalance() });
  const { data: summary } = useQuery({ queryKey: ['summary', startOfMonth, endOfMonth], queryFn: () => transactionService.getSummary(startOfMonth, endOfMonth) });
  const { data: recentTransactions = [] } = useQuery({ queryKey: ['recentTransactions'], queryFn: () => transactionService.getRecent(5) });
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountService.getAll() });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.getAll() });

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />{format(now, 'EEEE, d MMMM yyyy', { locale: id })}
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2"><Download className="h-4 w-4" />Export</Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2" size="sm"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Catat Transaksi</span><span className="sm:hidden">Transaksi</span></Button>
        </motion.div>
      </div>

      <SummaryCards totalBalance={totalBalance} totalIncome={summary?.income || 0} totalExpense={summary?.expense || 0} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions transactions={recentTransactions} />
        <SpendingChart />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Lihat Budget', href: '/dashboard/budgets', color: 'from-blue-500 to-cyan-500' },
          { label: 'Cek Goals', href: '/dashboard/goals', color: 'from-purple-500 to-pink-500' },
          { label: 'Laporan', href: '/dashboard/reports', color: 'from-orange-500 to-red-500' },
          { label: 'Pengaturan', href: '/dashboard/settings', color: 'from-green-500 to-emerald-500' },
        ].map((action) => (
          <a key={action.label} href={action.href} className="group relative overflow-hidden rounded-xl p-4 bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="relative flex items-center justify-between">
              <span className="font-medium">{action.label}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </a>
        ))}
      </motion.div>

      <TransactionForm open={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={async (data) => {
        await transactionService.create(data);
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['summary'] });
        queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
        queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      }} accounts={accounts} categories={categories} />
    </PageTransition>
  );
}
