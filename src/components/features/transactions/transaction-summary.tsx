'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
import { ArrowDownLeft, ArrowUpRight, Wallet, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  balance?: number;
  transactionCount: number;
  isLoading?: boolean;
  isHidden?: boolean;
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl p-5 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="rounded-2xl p-5 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-28 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="rounded-2xl p-5 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-20 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="rounded-2xl p-5 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-16 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function TransactionSummary({
  totalIncome,
  totalExpense,
  totalTransfer,
  balance,
  transactionCount,
  isLoading,
  isHidden,
}: TransactionSummaryProps) {
  const { t } = useI18n();
  if (isLoading) return <SummarySkeleton />;
  const calculatedBalance = balance ?? (totalIncome - totalExpense);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up">
      <div className="rounded-2xl p-5 border bg-card overflow-hidden card-hover">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">{t('transactions.totalIncome')}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-emerald-600 truncate">
              {formatCurrency(totalIncome, 'IDR', { isHidden })}
            </p>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {transactionCount} {t('transactions.transactionCount')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 shrink-0">
            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 border bg-card overflow-hidden card-hover">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">{t('transactions.totalExpense')}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-rose-600 truncate">
              {formatCurrency(totalExpense, 'IDR', { isHidden })}
            </p>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {t('transactions.period')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 shrink-0">
            <ArrowUpRight className="h-5 w-5 text-rose-600" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 border bg-card overflow-hidden card-hover">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">{t('transactions.totalTransfer')}</p>
            <p className="text-xl md:text-2xl font-bold mt-1 text-blue-600 truncate">
              {formatCurrency(totalTransfer, 'IDR', { isHidden })}
            </p>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {t('transactions.movement')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 shrink-0">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-5 border bg-card overflow-hidden card-hover">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">{t('transactions.balance')}</p>
            <p className={`text-xl md:text-2xl font-bold mt-1 truncate ${calculatedBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(calculatedBalance, 'IDR', { isHidden })}
            </p>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {calculatedBalance >= 0 ? t('transactions.surplus') : t('transactions.deficit')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 shrink-0">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
