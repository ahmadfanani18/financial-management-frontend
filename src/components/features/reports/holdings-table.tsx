'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import type { InvestmentHolding } from '@/services/report.service';

interface HoldingsTableProps {
  holdings: InvestmentHolding[];
  isLoading?: boolean;
  isHidden?: boolean;
}

export function HoldingsTable({ holdings, isLoading, isHidden }: HoldingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-muted-foreground">Aset</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Jumlah</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Harga Rata-rata</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Harga Saat Ini</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Nilai</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td className="py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : holdings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Belum ada holdings
                  </td>
                </tr>
              ) : (
                holdings.map(h => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{h.symbol}</div>
                      <div className="text-xs text-muted-foreground">{h.name}</div>
                    </td>
                    <td className="py-3 text-right">{h.shares}</td>
                    <td className="py-3 text-right">{formatCurrency(h.avgPrice, 'IDR', { isHidden })}</td>
                    <td className="py-3 text-right">{formatCurrency(h.currentPrice, 'IDR', { isHidden })}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(h.value, 'IDR', { isHidden })}</td>
                    <td className={`py-3 text-right font-medium ${h.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl, 'IDR', { isHidden })} ({h.pnlPercent}%)
                    </td>
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