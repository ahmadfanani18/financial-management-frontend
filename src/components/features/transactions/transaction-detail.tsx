'use client';

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

export function TransactionDetail({ transaction, open, onOpenChange }: TransactionDetailProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const isExpense = transaction.type === 'EXPENSE';
  const isTransfer = transaction.type === 'TRANSFER';
  const totalDebit = isTransfer ? transaction.amount + (transaction.adminFee || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isIncome ? 'bg-green-500 text-white' : isExpense ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {getTypeIcon(transaction.type)}
            </div>
            Detail Transaksi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">
              {isIncome ? '+' : isTransfer ? '-' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
            <Badge variant={isIncome ? 'success' : isTransfer ? 'default' : 'destructive'}>
              {getTypeLabel(transaction.type)}
            </Badge>
          </div>

          {isTransfer && transaction.adminFee && transaction.adminFee > 0 ? (
            <div className="space-y-3 border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jumlah Transfer</span>
                <span>-{formatCurrency(transaction.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biaya Admin</span>
                <span>-{formatCurrency(transaction.adminFee)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total Debit</span>
                <span>-{formatCurrency(totalDebit)}</span>
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                Penerima menerima {formatCurrency(transaction.amount)}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tanggal</span>
              <span className="ml-auto">
                {new Date(transaction.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Akun</span>
              <span className="ml-auto">
                {transaction.account?.name || 'Tidak ada'}
              </span>
            </div>

            {transaction.category && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Kategori</span>
                <span className="ml-auto">{transaction.category.name}</span>
              </div>
            )}

            {isTransfer && transaction.fromAccount && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground ml-6">Dari</span>
                <span className="ml-auto">{transaction.fromAccount.name}</span>
              </div>
            )}

            {isTransfer && transaction.toAccount && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground ml-6">Ke</span>
                <span className="ml-auto">{transaction.toAccount.name}</span>
              </div>
            )}
          </div>

          {transaction.description && (
            <div className="border-t pt-3">
              <p className="text-sm text-muted-foreground mb-1">Catatan</p>
              <p className="text-sm">{transaction.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}