'use client';

import { Transaction } from '@/services/transaction.service';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { TransactionCard } from './transaction-card';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

function TransactionSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted" />
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
}: TransactionListProps) {
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
        <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Belum ada transaksi</p>
        <p className="text-sm">Tambahkan transaksi pertama Anda.</p>
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
        />
      ))}
    </div>
  );
}
