'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
import { Transaction } from '@/services/transaction.service';
import { formatCurrency } from '@/lib/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, Tag, Wallet } from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
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

export function TransactionDetail({ transaction, open, onOpenChange, isHidden }: TransactionDetailProps) {
  const { t } = useI18n();
  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const isExpense = transaction.type === 'EXPENSE';
  const isTransfer = transaction.type === 'TRANSFER';
  const totalDebit = isTransfer ? transaction.amount + (transaction.adminFee || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div
              className={`p-2.5 rounded-xl ${
                isIncome ? 'bg-emerald-500 text-white' : isExpense ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {getTypeIcon(transaction.type)}
            </div>
            {t('transactions.detailTransaction')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
            <p className="text-2xl font-bold">
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount, 'IDR', { isHidden })}
            </p>
            <Badge variant={isIncome ? 'success' : isTransfer ? 'default' : 'destructive'}>
              {getTypeLabel(transaction.type, t)}
            </Badge>
          </div>

          {isTransfer && transaction.adminFee && transaction.adminFee > 0 ? (
            <div className="space-y-3 border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('transactions.transferAmount')}</span>
                <span>-{formatCurrency(transaction.amount, 'IDR', { isHidden })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('transactions.adminFee')}</span>
                <span>-{formatCurrency(transaction.adminFee, 'IDR', { isHidden })}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>{t('transactions.totalDebit')}</span>
                <span>-{formatCurrency(totalDebit, 'IDR', { isHidden })}</span>
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                {t('transactions.recipientReceives')} {formatCurrency(transaction.amount, 'IDR', { isHidden })}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('transactions.date')}</span>
              <span className="ml-auto font-medium">
                {new Date(transaction.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('transactions.account')}</span>
              <span className="ml-auto font-medium">
                {transaction.account?.name || t('transactions.noData')}
              </span>
            </div>

            {transaction.category && (
              <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('transactions.category')}</span>
                <span className="ml-auto font-medium">{transaction.category.name}</span>
              </div>
            )}

            {isTransfer && transaction.fromAccount && (
              <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground ml-7">{t('transactions.fromAccount')}</span>
                <span className="ml-auto font-medium">{transaction.fromAccount.name}</span>
              </div>
            )}

            {isTransfer && transaction.toAccount && (
              <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground ml-7">{t('transactions.toAccount')}</span>
                <span className="ml-auto font-medium">{transaction.toAccount.name}</span>
              </div>
            )}
          </div>

          {transaction.description && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">{t('transactions.note')}</p>
              <p className="text-sm bg-muted/30 p-3 rounded-lg">{transaction.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
