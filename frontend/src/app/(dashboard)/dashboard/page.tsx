'use client';

import { useQuery } from '@tanstack/react-query';
import { accountService } from '@/services/account.service';
import { transactionService } from '@/services/transaction.service';
import { SummaryCards } from '@/components/features/dashboard/summary-cards';
import { RecentTransactions } from '@/components/features/dashboard/recent-transactions';
import { SpendingChart } from '@/components/features/dashboard/spending-chart';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data: totalBalance = 0 } = useQuery({
    queryKey: ['totalBalance'],
    queryFn: () => accountService.getTotalBalance(),
  });

  const { data: summary } = useQuery({
    queryKey: ['summary', startOfMonth, endOfMonth],
    queryFn: () => transactionService.getSummary(startOfMonth, endOfMonth),
  });

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => transactionService.getRecent(5),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan keuangan Anda bulan ini</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Catat Transaksi
        </Button>
      </div>

      <SummaryCards
        totalBalance={totalBalance}
        totalIncome={summary?.income || 0}
        totalExpense={summary?.expense || 0}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentTransactions transactions={recentTransactions} />
        <SpendingChart />
      </div>
    </div>
  );
}
