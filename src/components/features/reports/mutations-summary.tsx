'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Props {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  startingBalance: number;
  endingBalance: number;
  isLoading?: boolean;
  isHidden?: boolean;
}

export function MutationsSummary({ totalIncome, totalExpense, totalTransfer, startingBalance, endingBalance, isLoading, isHidden }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="overflow-hidden">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowUpCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Pemasukan</span>
          </div>
          <p className="text-base sm:text-lg md:text-2xl font-bold text-emerald-500 truncate">{formatCurrency(totalIncome, 'IDR', { isHidden })}</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowDownCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="truncate">Pengeluaran</span>
          </div>
          <p className="text-base sm:text-lg md:text-2xl font-bold text-rose-500 truncate">{formatCurrency(totalExpense, 'IDR', { isHidden })}</p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeftRight className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="truncate">Transfer</span>
          </div>
          <p className="text-base sm:text-lg md:text-2xl font-bold text-blue-500 truncate">
            {totalTransfer >= 0 ? '+' : ''}{formatCurrency(totalTransfer, 'IDR', { isHidden })}
          </p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground truncate">Saldo</div>
          <p className="text-base sm:text-lg md:text-2xl font-bold truncate">
            {formatCurrency(endingBalance, 'IDR', { isHidden })}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            awal: {formatCurrency(startingBalance, 'IDR', { isHidden })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}