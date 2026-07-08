'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
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
  onView?: (transaction: Transaction) => void;
  isHidden?: boolean;
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

function getTypeLabel(type: Transaction['type'], t: (key: string) => string) {
  switch (type) {
    case 'INCOME':
      return t('transactions.income');
    case 'EXPENSE':
      return t('transactions.expense');
    case 'TRANSFER':
      return t('transactions.transfer');
  }
}

function getTypeColor(type: Transaction['type']) {
  switch (type) {
    case 'INCOME':
      return 'bg-emerald-500 text-white';
    case 'EXPENSE':
      return 'bg-rose-500 text-white';
    case 'TRANSFER':
      return 'bg-blue-500 text-white';
  }
}

export function TransactionCard({ transaction, onEdit, onDelete, onView, isHidden }: TransactionCardProps) {
  const { t } = useI18n();
  const isPositive = transaction.type === 'INCOME';
  const isTransfer = transaction.type === 'TRANSFER';
  const hasAdminFee = isTransfer && transaction.adminFee && transaction.adminFee > 0;

  return (
    <Card
      className="rounded-2xl border bg-card p-5 card-hover overflow-hidden relative"
      onClick={() => onView?.(transaction)}
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: transaction.category?.color || (isPositive ? '#22C55E' : isTransfer ? '#3B82F6' : '#EF4444') }}
      />
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${getTypeColor(transaction.type)}`}
          >
            {getTypeIcon(transaction.type)}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="font-semibold truncate">{transaction.description || t('transactions.noDescription')}</h3>
            <div className="flex items-center gap-2 mt-0.5 min-w-0 overflow-hidden">
              <Badge variant="secondary" className="text-xs shrink-0 max-w-[100px] truncate">
                {transaction.category?.name || t('transactions.noCategory')}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {transaction.account?.name || t('transactions.noAccount')}
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
        {isTransfer && transaction.toAccount && (
          <p className="text-xs text-muted-foreground mb-3">
            {t('transactions.toAccount')}: {transaction.toAccount.name}
            {hasAdminFee && (
              <span className="text-orange-500 ml-1">
                (+Fee {new Intl.NumberFormat('id-ID').format(transaction.adminFee!)})
              </span>
            )}
          </p>
        )}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <Badge
              variant={isPositive ? 'success' : isTransfer ? 'default' : 'destructive'}
              className="mt-1 text-xs"
            >
              {getTypeLabel(transaction.type, t)}
            </Badge>
          </div>
          <p
            className={`text-xl font-bold ${
              isPositive ? 'text-emerald-600' : isTransfer ? 'text-blue-600' : 'text-rose-600'
            }`}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(transaction.amount, 'IDR', { isHidden })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
