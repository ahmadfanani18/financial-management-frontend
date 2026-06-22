'use client';

import { useI18n } from '@/components/i18n/i18n-provider';

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
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  const pnlColor = totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500';
  const pnlPrefix = totalPnL >= 0 ? '+' : '';

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{t('investment.totalPortfolio')}</p>
          <p className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('investment.uninvestedCash')}</p>
            <p className="text-lg font-semibold">{formatCurrency(totalUninvested)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('investment.holdingsValue')}</p>
            <p className="text-lg font-semibold">{formatCurrency(totalHoldingsValue)}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">{t('investment.totalPnL')}</p>
          <p className={`text-xl font-bold ${pnlColor}`}>
            {pnlPrefix}{formatCurrency(totalPnL)}
          </p>
        </div>
      </div>
    </div>
  );
}
