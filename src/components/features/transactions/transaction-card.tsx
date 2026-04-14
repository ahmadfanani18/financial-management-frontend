'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/services/transaction.service';
import { formatCurrency } from '@/lib/currency';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { TransactionActions } from './transaction-actions';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

function getTypeIcon(type: Transaction['type']) {
  switch (type) {
    case 'INCOME':
      return <ArrowDownLeft className="h-5 w-5" />;
    case 'EXPENSE':
      return <ArrowUpRight className="h-5 w-5" />;
    case 'TRANSFER':
      return <ArrowLeftRight className="h-5 w-5" />;
  }
}

function getTypeLabel(type: Transaction['type']) {
  switch (type) {
    case 'INCOME':
      return 'Pemasukan';
    case 'EXPENSE':
      return 'Pengeluaran';
    case 'TRANSFER':
      return 'Transfer';
  }
}

function getTypeColor(type: Transaction['type']) {
  switch (type) {
    case 'INCOME':
      return 'bg-green-500 text-white';
    case 'EXPENSE':
      return 'bg-red-500 text-white';
    case 'TRANSFER':
      return 'bg-blue-500 text-white';
  }
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isPositive = transaction.type === 'INCOME';
  const isTransfer = transaction.type === 'TRANSFER';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${getTypeColor(transaction.type)}`}
            style={{
              backgroundColor: transaction.category?.color || undefined,
            }}
          >
            {getTypeIcon(transaction.type)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{transaction.description || 'Tanpa Deskripsi'}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                {transaction.category?.name || 'Tanpa Kategori'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {transaction.account?.name || 'Tanpa Akun'}
              </span>
            </div>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <TransactionActions
            onEdit={() => onEdit?.(transaction)}
            onDelete={() => onDelete?.(transaction.id)}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{transaction.date}</p>
            <Badge
              variant={isPositive ? 'success' : isTransfer ? 'default' : 'destructive'}
              className="mt-1 text-xs"
            >
              {getTypeLabel(transaction.type)}
            </Badge>
          </div>
          <p
            className={`text-xl font-bold ${
              isPositive ? 'text-green-600' : isTransfer ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
