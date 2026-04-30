'use client';

import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface TransactionSummaryProps {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  isLoading?: boolean;
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
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
  transactionCount,
  isLoading,
}: TransactionSummaryProps) {
  if (isLoading) return <SummarySkeleton />;
  const balance = totalIncome - totalExpense;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background rounded-xl p-6 border border-green-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Pemasukan</p>
            <p className="text-3xl font-bold mt-1 text-green-600">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {transactionCount} transaksi
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-background rounded-xl p-6 border border-red-500/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Pengeluaran</p>
            <p className="text-3xl font-bold mt-1 text-red-600">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Periode ini
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10">
            <ArrowUpRight className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl p-6 border border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Selisih</p>
            <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-primary' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {balance >= 0 ? 'Surplus' : 'Defisit'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
