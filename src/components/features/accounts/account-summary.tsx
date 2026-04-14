'use client';

import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface AccountSummaryProps {
  totalBalance: number;
  accountCount: number;
}

export function AccountSummary({ totalBalance, accountCount }: AccountSummaryProps) {
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
