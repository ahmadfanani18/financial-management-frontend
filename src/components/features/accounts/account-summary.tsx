'use client';

import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

interface AccountSummaryProps {
  totalBalance: number;
  accountCount: number;
  isLoading?: boolean;
}

function AccountSummarySkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-32 mt-1" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

export function AccountSummary({ totalBalance, accountCount, isLoading }: AccountSummaryProps) {
  if (isLoading) {
    return <AccountSummarySkeleton />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Saldo</p>
          <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {accountCount} akun aktif
          </p>
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
