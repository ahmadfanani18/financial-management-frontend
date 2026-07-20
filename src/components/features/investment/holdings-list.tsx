'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/components/i18n/i18n-provider';
import type { Holding } from '@/services/investment.service';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { SellModal } from './sell-modal';

interface SellHolding extends Omit<Holding, 'shares' | 'avgBuyPrice' | 'currentPrice'> {
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

interface HoldingsListProps {
  holdings: Holding[];
  searchQuery?: string;
  isLoading?: boolean;
  isHidden?: boolean;
  onEdit: (holding: Holding) => void;
  onDelete: (holding: Holding) => void;
  refetch?: () => void;
}

const ASSET_COLORS: Record<string, { bg: string; from: string; to: string }> = {
  BTC: { bg: 'bg-orange-500', from: '#F7931A', to: '#FFCB4F' },
  ETH: { bg: 'bg-blue-500', from: '#627EEA', to: '#8FA3D9' },
  SOL: { bg: 'bg-purple-500', from: '#9945FF', to: '#B8A4FF' },
  AAPL: { bg: 'bg-gray-700', from: '#333333', to: '#666666' },
  GOOGL: { bg: 'bg-blue-500', from: '#4285F4', to: '#7BB3F0' },
  MSFT: { bg: 'bg-sky-500', from: '#00A4EF', to: '#7EC8E3' },
  AMZN: { bg: 'bg-orange-500', from: '#FF9900', to: '#FFB366' },
  TSLA: { bg: 'bg-red-600', from: '#CC0000', to: '#FF4444' },
  BBRI: { bg: 'bg-red-500', from: '#D81F26', to: '#FF6B6B' },
  BBCA: { bg: 'bg-blue-700', from: '#003B70', to: '#0055A4' },
  TLKM: { bg: 'bg-red-500', from: '#E3051B', to: '#FF4D4D' },
  UNVR: { bg: 'bg-green-500', from: '#4D8B31', to: '#7CAF5A' },
  GOTO: { bg: 'bg-green-500', from: '#00AA14', to: '#00CC1A' },
  BBNI: { bg: 'bg-blue-700', from: '#003B70', to: '#0055A4' },
};

function getAssetColor(symbol: string): { bg: string; from: string; to: string } {
  return ASSET_COLORS[symbol] || { bg: 'bg-gray-500', from: '#6B7280', to: '#9CA3AF' };
}

function getAssetTypeBadge(type: string): { labelKey: string; className: string } {
  switch (type) {
    case 'CRYPTO':
      return { labelKey: 'investment.assetType.crypto', className: 'bg-orange-500/10 text-orange-600' };
    case 'US_STOCK':
      return { labelKey: 'investment.assetType.usStock', className: 'bg-blue-500/10 text-blue-600' };
    case 'IDX_STOCK':
      return { labelKey: 'investment.assetType.idxStock', className: 'bg-amber-500/10 text-amber-600' };
    default:
      return { labelKey: type, className: 'bg-gray-500/10 text-gray-600' };
  }
}

export function HoldingsList({
  holdings,
  searchQuery = '',
  isLoading,
  isHidden,
  onEdit,
  onDelete,
  refetch,
}: HoldingsListProps) {
  const { t } = useI18n();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<SellHolding | null>(null);

  const filteredHoldings = useMemo(() => {
    if (!searchQuery.trim()) return holdings;
    const query = searchQuery.toLowerCase();
    return holdings.filter(
      (h) =>
        h.symbol.toLowerCase().includes(query) ||
        h.name?.toLowerCase().includes(query)
    );
  }, [holdings, searchQuery]);

  const handleSell = (holding: Holding) => {
    const sellHolding: SellHolding = {
      ...holding,
      quantity: parseInt(holding.shares),
      avgBuyPrice: Number(holding.avgBuyPrice),
      currentPrice: Number(holding.currentPrice),
    };
    setSelectedHolding(sellHolding);
    setSellModalOpen(true);
  };

  const formatCurrency = (value: string | number) => {
    if (isHidden) return '••••••';
    const num = Number(value);
    return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-24 bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('investment.noHoldings')}
      </div>
    );
  }

  if (filteredHoldings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('investment.searchNoResults', { query: searchQuery })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredHoldings.map((holding) => {
        const pnl = Number(holding.pnl);
        const pnlPercent = Number(holding.pnlPercent);
        const isProfit = pnl >= 0;
        const pnlColor = isProfit ? 'text-emerald-500' : 'text-red-500';
        const pnlBgColor = isProfit ? 'bg-emerald-500/10' : 'bg-red-500/10';
        const pnlBorderColor = isProfit ? 'border-emerald-500/20' : 'border-red-500/20';
        const pnlPrefix = isProfit ? '+' : '';
        const pnlPercentPrefix = isProfit ? '+' : '';

        const colorScheme = getAssetColor(holding.symbol);
        const typeBadge = getAssetTypeBadge(holding.type);

        return (
          <div
            key={holding.id}
            className="bg-card rounded-2xl border p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme.from} 0%, ${colorScheme.to} 100%)`,
                  }}
                >
                  {holding.symbol.substring(0, 4)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{holding.symbol}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge.className}`}>
                      {t(typeBadge.labelKey)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {holding.type === 'IDX_STOCK'
                      ? `${holding.shares} ${t('investment.sharesUnit')}`
                      : holding.shares}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block min-w-[180px]">
                  <p className="text-sm text-muted-foreground">{t('investment.avgBuyPrice')}</p>
                  <p className="font-medium text-muted-foreground tabular-nums">{formatCurrency(holding.avgBuyPrice)}</p>
                </div>

                <div className="text-right hidden sm:block min-w-[180px]">
                  <p className="text-sm text-muted-foreground">{t('investment.currentPrice')}</p>
                  <p className="font-medium tabular-nums">{formatCurrency(holding.currentPrice)}</p>
                </div>

                <div className="text-right min-w-[180px]">
                  <p className="text-sm text-muted-foreground">{t('investment.totalValue')}</p>
                  <p className="text-lg font-bold tabular-nums">{formatCurrency(holding.currentValue || holding.currentPrice)}</p>
                </div>

                <div className={`text-right min-w-[180px] p-3 rounded-xl border ${pnlBgColor} ${pnlBorderColor}`}>
                  <p className="text-sm text-muted-foreground">{t('investment.pnl')}</p>
                  <p className={`text-lg font-bold tabular-nums ${pnlColor}`}>
                    {pnlPrefix}{formatCurrency(pnl)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(holding)}
                    className="hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(holding)}
                    className="hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                  <Button
                    onClick={() => handleSell(holding)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    {t('investment.sell')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 sm:hidden">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t('investment.mobile.avgPrice')}</p>
                <p className="font-medium text-muted-foreground tabular-nums">{formatCurrency(holding.avgBuyPrice)}</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t('investment.mobile.current')}</p>
                <p className="font-medium tabular-nums">{formatCurrency(holding.currentPrice)}</p>
              </div>
              <div className={`flex-1 text-right p-2 rounded-lg ${pnlBgColor}`}>
                <p className="text-xs text-muted-foreground">{t('investment.pnl')}</p>
                <p className={`font-bold tabular-nums ${pnlColor}`}>
                  {pnlPrefix}{formatCurrency(pnl)}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        holding={selectedHolding}
        onSuccess={refetch || (() => {})}
      />
    </div>
  );
}
