'use client';

import { useI18n } from '@/components/i18n/i18n-provider';
import { TrendingUp, TrendingDown, Wallet, PieChart, Coins, BarChart3 } from 'lucide-react';

interface PortfolioSummaryProps {
  totalPortfolioValue: number;
  totalUninvested: number;
  totalHoldingsValue: number;
  totalPnL: number;
  isLoading?: boolean;
  isHidden?: boolean;
}

export function PortfolioSummary({
  totalPortfolioValue,
  totalUninvested,
  totalHoldingsValue,
  totalPnL,
  isLoading,
  isHidden,
}: PortfolioSummaryProps) {
  const { t } = useI18n();

  const formatCurrency = (value: number) => {
    if (isHidden) return 'Rp •••••••';
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-32 bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  const pnlColor = totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500';
  const pnlBgColor = totalPnL >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const pnlBorderColor = totalPnL >= 0 ? 'border-emerald-500/20' : 'border-red-500/20';
  const pnlPrefix = totalPnL >= 0 ? '+' : '';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Portfolio Value */}
      <div className="bg-card rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('investment.totalPortfolio')}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalPortfolioValue)}</p>
        <p className="text-xs text-muted-foreground mt-1">+12.5% dari awal bulan</p>
      </div>

      {/* Uninvested Cash */}
      <div className="bg-card rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('investment.uninvestedCash')}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalUninvested)}</p>
        <p className="text-xs text-muted-foreground mt-1">Tersedia untuk beli aset</p>
      </div>

      {/* Holdings Value */}
      <div className="bg-card rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <PieChart className="h-5 w-5 text-purple-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('investment.holdingsValue')}</span>
        </div>
        <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalHoldingsValue)}</p>
        <p className="text-xs text-muted-foreground mt-1">8 aset berbeda</p>
      </div>

      {/* Total P&L */}
      <div className="bg-card rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${pnlBgColor} border ${pnlBorderColor}`}>
            {totalPnL >= 0 ? (
              <TrendingUp className={`h-5 w-5 ${pnlColor}`} />
            ) : (
              <TrendingDown className={`h-5 w-5 ${pnlColor}`} />
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('investment.totalPnL')}</span>
        </div>
        <p className={`text-2xl font-bold tracking-tight ${pnlColor}`}>
          {pnlPrefix}{formatCurrency(totalPnL)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">+13.8% total return</p>
      </div>
    </div>
  );
}
