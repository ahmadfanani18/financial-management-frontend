'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { accountService } from '@/services/account.service';
import { transactionService } from '@/services/transaction.service';
import { SummaryCards } from '@/components/features/dashboard/summary-cards';
import { RecentTransactions } from '@/components/features/dashboard/recent-transactions';
import { SpendingChart } from '@/components/features/dashboard/spending-chart';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, TrendingUp, Calendar, Download } from 'lucide-react';
import { PageTransition } from '@/components/ui/motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function DashboardPage() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const queryClient = useQueryClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data: totalBalance = 0, isLoading: loadingBalance } = useQuery({ queryKey: ['totalBalance'], queryFn: () => accountService.getTotalBalance() });
  const { data: summary, isLoading: loadingSummary } = useQuery({ queryKey: ['summary', startOfMonth, endOfMonth], queryFn: () => transactionService.getSummary(startOfMonth, endOfMonth) });
  const { data: recentTransactions = [], isLoading: loadingTransactions } = useQuery({ queryKey: ['recentTransactions'], queryFn: () => transactionService.getRecent(5) });

  const isLoading = loadingBalance || loadingSummary || loadingTransactions;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard.title')}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />{format(now, 'EEEE, d MMMM yyyy', { locale: id })}
          </motion.p>
        </div>
        
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <SummaryCards totalBalance={totalBalance} totalIncome={summary?.income || 0} totalExpense={summary?.expense || 0} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <RecentTransactions transactions={recentTransactions} />
        )}
        <SpendingChart />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('dashboard.viewBudget'), href: '/dashboard/budgets', color: 'from-blue-500 to-cyan-500' },
          { label: t('dashboard.checkGoals'), href: '/dashboard/goals', color: 'from-purple-500 to-pink-500' },
          { label: t('nav.reports'), href: '/dashboard/reports', color: 'from-orange-500 to-red-500' },
          { label: t('nav.settings'), href: '/dashboard/settings', color: 'from-green-500 to-emerald-500' },
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

      <TransactionForm open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setFormError(undefined);
      }} onSubmit={async (data) => {
        setFormError(undefined);
        try {
          await transactionService.create(data);
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['summary'] });
          queryClient.invalidateQueries({ queryKey: ['totalBalance'] });
          queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
        } catch (err: unknown) {
          setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        }
      }} error={formError} />
    </PageTransition>
  );
}
