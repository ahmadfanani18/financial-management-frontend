'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface PortfolioSummaryCardsProps {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdingsCount: number;
  isHidden?: boolean;
}

export function PortfolioSummaryCards({ totalValue, totalPnL, totalPnLPercent, holdingsCount, isHidden }: PortfolioSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Total Nilai Portfolio</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue, 'IDR', { isHidden })}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
          <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL, 'IDR', { isHidden })}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Return</p>
          <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Jumlah Aset</p>
          <p className="text-2xl font-bold">{holdingsCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}