'use client';

import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n/i18n-provider';

interface AccountSummaryProps {
  totalBalance: number;
  accountCount: number;
  isLoading?: boolean;
  isHidden?: boolean;
}

function AccountSummarySkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-14 w-14 rounded-2xl" />
      </div>
    </div>
  );
}

export function AccountSummary({ totalBalance, accountCount, isLoading, isHidden }: AccountSummaryProps) {
  const { t } = useI18n();

  if (isLoading) {
    return <AccountSummarySkeleton />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 p-6 animate-slide-up">
      <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">{t('accounts.totalBalance')}</span>
          </div>
          <p className={cn(
            "text-4xl sm:text-5xl font-bold tracking-tight",
            isHidden ? "text-foreground/50" : "text-foreground"
          )}>
            {isHidden ? '••••••••' : formatCurrency(totalBalance, 'IDR', { isHidden })}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="px-3 py-1 rounded-full bg-success/10 border border-success/20">
              <span className="text-sm font-medium text-success">
                {t('accounts.accountsActive', { count: accountCount })}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
          <Wallet className="h-7 w-7 text-success" />
        </div>
      </div>
    </div>
  );
}
