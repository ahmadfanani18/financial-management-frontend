'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import type { InvestmentTransaction } from '@/services/report.service';

interface InvestmentTransactionsTableProps {
  transactions: InvestmentTransaction[];
  isLoading?: boolean;
  isHidden?: boolean;
}

export function InvestmentTransactionsTable({ transactions, isLoading, isHidden }: InvestmentTransactionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Tanggal</th>
                <th className="pb-3 font-medium text-muted-foreground">Tipe</th>
                <th className="pb-3 font-medium text-muted-foreground">Aset</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Jumlah</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Harga</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3"><Skeleton className="h-6 w-12" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        t.type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{t.symbol}</td>
                    <td className="py-3 text-right">{t.shares}</td>
                    <td className="py-3 text-right">{formatCurrency(t.price, 'IDR', { isHidden })}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(t.total, 'IDR', { isHidden })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}