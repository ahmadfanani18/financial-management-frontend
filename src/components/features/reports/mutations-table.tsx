'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: string;
  amount: number;
  category: { name: string } | null;
  toAccount: { name: string } | null;
  runningBalance: number;
  adminFee?: number;
}

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  isHidden?: boolean;
}

const typeColors: Record<string, string> = {
  INCOME: 'text-emerald-500',
  EXPENSE: 'text-rose-500',
  TRANSFER: 'text-blue-500',
};

export function MutationsTable({ transactions, isLoading, isHidden }: Props) {
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Tanggal</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Deskripsi</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tipe</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Jumlah</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Kategori</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tujuan</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i}>
                <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24 ml-auto" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-4 py-3"><Skeleton className="h-4 w-24 ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Tidak ada transaksi dalam periode ini
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">Tanggal</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Deskripsi</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Tipe</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Jumlah</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Kategori</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Tujuan</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map(t => (
            <tr key={t.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 text-sm">{new Date(t.date).toLocaleDateString('id-ID')}</td>
              <td className="px-4 py-3 text-sm">{t.description || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <span className={typeColors[t.type]}>{t.type}</span>
              </td>
              <td className={`px-4 py-3 text-sm text-right font-medium ${typeColors[t.type]}`}>
                <div>{t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, 'IDR', { isHidden })}</div>
                {t.type === 'TRANSFER' && t.adminFee ? (
                  <div className="text-xs text-muted-foreground">+ {formatCurrency(t.adminFee, 'IDR', { isHidden })} admin</div>
                ) : null}
              </td>
              <td className="px-4 py-3 text-sm">{t.category?.name || '-'}</td>
              <td className="px-4 py-3 text-sm">{t.toAccount?.name || '-'}</td>
              <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(t.runningBalance, 'IDR', { isHidden })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}