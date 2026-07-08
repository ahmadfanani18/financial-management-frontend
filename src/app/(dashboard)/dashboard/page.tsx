'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { accountService } from '@/services/account.service';
import { transactionService } from '@/services/transaction.service';
import { SummaryCards } from '@/components/features/dashboard/summary-cards';
import { RecentTransactions } from '@/components/features/dashboard/recent-transactions';
import { SpendingChart } from '@/components/features/dashboard/spending-chart';
import { GoalsProgressCard } from '@/components/features/dashboard/goals-progress-card';
import { AccountBalancesCard } from '@/components/features/dashboard/account-balances-card';
import { AiInsightsCard } from '@/components/features/dashboard/ai-insights-card';
import { BillDashboardWidget } from '@/components/features/bills';
import { TransactionForm } from '@/components/forms/transaction-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AmountVisibilityToggle } from '@/components/ui/amount-visibility-toggle';
import { Plus, TrendingUp, Calendar, Download, Eye, EyeOff } from 'lucide-react';
import { PageTransition } from '@/components/ui/motion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useI18n } from '@/components/i18n/i18n-provider';
import { TrialBanner } from '@/components/subscription/trial-banner';
import { useAmountVisibility } from '@/hooks/use-amount-visibility';
import { useAuthStore } from '@/stores/auth.store';
import { AdminDashboard } from '@/components/features/dashboard/admin-dashboard';

function PaymentSuccessToast() {
  const searchParams = useSearchParams();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showSuccessToast) return null;

  return (
    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center gap-2">
      <span className="font-medium">Pembayaran berhasil!</span>
      <span className="text-sm">Sekarang Anda menjadi PRO member.</span>
    </div>
  );
}

function DashboardContent() {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const queryClient = useQueryClient();
  const { isHidden, toggle } = useAmountVisibility('dashboard');
  const { user, isPro } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data: totalBalance = 0, isLoading: loadingBalance } = useQuery({ queryKey: ['totalBalance'], queryFn: () => accountService.getTotalBalance() });
  const { data: summary, isLoading: loadingSummary } = useQuery({ queryKey: ['summary', startOfMonth, endOfMonth], queryFn: () => transactionService.getSummary(startOfMonth, endOfMonth) });
  const { data: recentTransactions = [], isLoading: loadingTransactions } = useQuery({ queryKey: ['recentTransactions'], queryFn: () => transactionService.getRecent(5) });

  const isLoading = loadingBalance || loadingSummary || loadingTransactions;

  if (isAdmin) {
    return (
      <PageTransition className="space-y-6">
        <AdminDashboard stats={{
          totalUsers: 0,
          freeUsers: 0,
          proUsers: 0,
          pendingPayments: 0,
          expiringSoon: 0,
        }} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <TrialBanner />
      <Suspense fallback={null}>
        <PaymentSuccessToast />
      </Suspense>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard.title')}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted-foreground flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            {format(now, 'EEEE, d MMMM yyyy', { locale: id })}
          </motion.p>
        </div>
        <AmountVisibilityToggle isHidden={isHidden} onToggle={toggle} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <SummaryCards totalBalance={totalBalance} totalIncome={summary?.income || 0} totalExpense={summary?.expense || 0} totalTransfer={summary?.transfer || 0} isHidden={isHidden} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
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
          <RecentTransactions transactions={recentTransactions} isHidden={isHidden} />
        )}
        <SpendingChart isHidden={isHidden} />
      </div>

      <div className={`grid gap-4 ${isPro ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        <GoalsProgressCard isHidden={isHidden} />
        <AccountBalancesCard isHidden={isHidden} />
        <BillDashboardWidget isHidden={isHidden} />
        {isPro && <AiInsightsCard isHidden={isHidden} summary={summary} />}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('dashboard.viewBudget'), href: '/dashboard/budgets', icon: TrendingUp },
          { label: t('dashboard.checkGoals'), href: '/dashboard/goals', icon: TrendingUp },
          { label: t('nav.reports'), href: '/dashboard/reports', icon: TrendingUp },
          { label: t('nav.settings'), href: '/dashboard/settings', icon: TrendingUp },
        ].map((action) => (
          <a key={action.label} href={action.href} className="group relative overflow-hidden rounded-xl p-4 bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <div className="relative flex items-center justify-between">
              <span className="font-medium text-sm">{action.label}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
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

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
