'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
import { Transaction } from '@/services/transaction.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { TransactionCard } from './transaction-card';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onView?: (transaction: Transaction) => void;
  isHidden?: boolean;
}

function TransactionSkeleton() {
  return (
    <Card className="rounded-2xl animate-pulse">
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-muted" />
          <div className="flex-1">
            <div className="h-4 w-32 rounded bg-muted mb-2" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-6 w-24 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionList({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  onView,
  isHidden,
}: TransactionListProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
          <Receipt className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium">{t('transactions.noTransactions')}</p>
        <p className="text-sm">{t('transactions.addFirst')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          isHidden={isHidden}
        />
      ))}
    </div>
  );
}
