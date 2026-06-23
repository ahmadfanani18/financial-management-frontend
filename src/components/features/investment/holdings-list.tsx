'use client';

import { useState } from 'react';
import { useI18n } from '@/components/i18n/i18n-provider';
import type { Holding } from '@/services/investment.service';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { SellModal } from './sell-modal';

interface SellHolding extends Omit<Holding, 'shares' | 'avgBuyPrice' | 'currentPrice'> {
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

interface HoldingsListProps {
  holdings: Holding[];
  isLoading?: boolean;
  isHidden?: boolean;
  onEdit: (holding: Holding) => void;
  onDelete: (holding: Holding) => void;
  refetch?: () => void;
}

export function HoldingsList({ holdings, isLoading, isHidden, onEdit, onDelete, refetch }: HoldingsListProps) {
  const { t } = useI18n();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<SellHolding | null>(null);

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

  const formatCurrency = (value: string) => {
    if (isHidden) return 'Rp •••';
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium">{t('investment.asset')}</th>
            <th className="px-4 py-3 text-right text-sm font-medium">{t('investment.shares')}</th>
            <th className="px-4 py-3 text-right text-sm font-medium">{t('investment.avgBuyPrice')}</th>
            <th className="px-4 py-3 text-right text-sm font-medium">{t('investment.currentPrice')}</th>
            <th className="px-4 py-3 text-right text-sm font-medium">{t('investment.pnl')}</th>
            <th className="px-4 py-3 text-center text-sm font-medium">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const pnlColor = Number(holding.pnl) >= 0 ? 'text-emerald-500' : 'text-red-500';
            const pnlPrefix = Number(holding.pnl) >= 0 ? '+' : '';
            const pnlPercentPrefix = Number(holding.pnlPercent) >= 0 ? '+' : '';

            return (
              <tr key={holding.id} className="border-t">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{holding.symbol}</p>
                    <p className="text-xs text-muted-foreground">{holding.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {holding.type === 'IDX_STOCK' 
                    ? `${holding.shares} ${t('investment.sharesUnit')}` 
                    : holding.shares}
                </td>
                <td className="px-4 py-3 text-right">{formatCurrency(holding.avgBuyPrice)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(holding.currentPrice)}</td>
                <td className={`px-4 py-3 text-right ${pnlColor}`}>
                  <div>
                    <p>{pnlPrefix}{formatCurrency(holding.pnl)}</p>
                    <p className="text-xs">{pnlPercentPrefix}{holding.pnlPercent}%</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(holding)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(holding)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => handleSell(holding)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                    >
                      Jual
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        holding={selectedHolding}
        onSuccess={refetch || (() => {})}
      />
    </div>
  );
}
