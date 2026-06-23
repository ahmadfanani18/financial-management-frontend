'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { reportService } from '@/services/report.service';
import { accountService } from '@/services/account.service';
import { formatCurrency } from '@/lib/currency';
import { PortfolioSummaryCards } from './portfolio-summary-cards';
import { PerformanceChart } from './performance-chart';
import { AllocationChart } from './allocation-chart';
import { HoldingsTable } from './holdings-table';
import { InvestmentTransactionsTable } from './investment-transactions-table';

interface InvestmentReportTabProps {
  isHidden?: boolean;
}

export function InvestmentReportTab({ isHidden }: InvestmentReportTabProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });

  const investmentAccounts = accounts?.filter((a: any) => a.type === 'INVESTMENT') || [];

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['investmentSummary', selectedAccountId],
    queryFn: () => reportService.getInvestmentSummary(selectedAccountId || undefined),
    enabled: investmentAccounts.length > 0,
  });

  const { data: performance = [], isLoading: performanceLoading } = useQuery({
    queryKey: ['investmentPerformance', selectedAccountId],
    queryFn: () => reportService.getInvestmentPerformance(6, selectedAccountId || undefined),
    enabled: investmentAccounts.length > 0,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['investmentTransactions', selectedAccountId],
    queryFn: () => reportService.getInvestmentTransactions({ accountId: selectedAccountId || undefined }),
    enabled: investmentAccounts.length > 0,
  });

  if (investmentAccounts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Belum ada akun investasi. Tambahkan akun investasi terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Akun Investasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Akun Investasi</SelectItem>
            {investmentAccounts.map((acc: any) => (
              <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-lg p-4 space-y-2 bg-muted">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <PortfolioSummaryCards
          totalValue={summary.totalValue}
          totalPnL={summary.totalPnL}
          totalPnLPercent={summary.totalPnLPercent}
          holdingsCount={summary.holdingsCount}
          isHidden={isHidden}
        />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart data={performance} isLoading={performanceLoading} />
        <AllocationChart holdings={summary?.holdings || []} isLoading={summaryLoading} />
      </div>

      <HoldingsTable holdings={summary?.holdings || []} isLoading={summaryLoading} isHidden={isHidden} />

      <InvestmentTransactionsTable
        transactions={transactionsData?.transactions || []}
        isLoading={transactionsLoading}
        isHidden={isHidden}
      />
    </div>
  );
}