'use client';

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
      <div className="rounded-xl p-6 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="rounded-xl p-6 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-28 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="rounded-xl p-6 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-20 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="rounded-xl p-6 border bg-muted/50 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 w-16 rounded bg-muted mb-3" />
            <div className="h-8 w-32 rounded bg-muted mb-3" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted" />
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
  if (isLoading) return <SummarySkeleton />;
  const calculatedBalance = balance ?? (totalIncome - totalExpense);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background rounded-xl p-6 border border-green-500/20 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">Total Pemasukan</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-green-600 truncate">
              {formatCurrency(totalIncome, 'IDR', { isHidden })}
            </p>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {transactionCount} transaksi
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 shrink-0">
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-background rounded-xl p-6 border border-red-500/20 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">Total Pengeluaran</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-red-600 truncate">
              {formatCurrency(totalExpense, 'IDR', { isHidden })}
            </p>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              Periode ini
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 shrink-0">
            <ArrowUpRight className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background rounded-xl p-6 border border-blue-500/20 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">Total Transfer</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold mt-1 text-blue-600 truncate">
              {formatCurrency(totalTransfer, 'IDR', { isHidden })}
            </p>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              Perpindahan
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 shrink-0">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-muted-foreground truncate">Selisih</p>
            <p className={`text-lg sm:text-xl md:text-2xl font-bold mt-1 truncate ${calculatedBalance >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatCurrency(calculatedBalance, 'IDR', { isHidden })}
            </p>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {calculatedBalance >= 0 ? 'Surplus' : 'Defisit'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 shrink-0">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
