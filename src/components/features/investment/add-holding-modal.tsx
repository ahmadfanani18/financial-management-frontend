'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/i18n/i18n-provider';
import { AssetSearch } from './asset-search';
import type { AssetSearchResult, CreateHoldingInput } from '@/services/investment.service';

const IDX_STOCK_SYMBOLS = ['BBCA', 'BBRI', 'BMRI', 'SMGR', 'JSMR', 'TLKM', 'UNTR', 'PTBA', 'PGAS', 'ANTM', 'CTRA', 'FORE', 'DADA'];

function isIdxStock(symbol: string): boolean {
  return IDX_STOCK_SYMBOLS.includes(symbol.toUpperCase());
}

function toLot(shares: string | number, symbol: string): string {
  const numShares = typeof shares === 'string' ? parseFloat(shares) : shares;
  if (isIdxStock(symbol)) {
    return (numShares / 100).toString();
  }
  return numShares.toString();
}

interface AddHoldingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateHoldingInput) => Promise<void>;
  initialData?: CreateHoldingInput & { sharesDisplay?: string };
  availableBalance: number;
  isLoading?: boolean;
}

export function AddHoldingModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  availableBalance,
  isLoading,
}: AddHoldingModalProps) {
  const { t } = useI18n();
  const [symbol, setSymbol] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [shares, setShares] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      const symbol = initialData.symbol || '';
      setSymbol(symbol);
      const sharesInLot = toLot(initialData.shares || '', symbol);
      setShares(sharesInLot);
      setAvgBuyPrice(initialData.avgBuyPrice || '');
      if (isIdxStock(symbol)) {
        setSelectedAsset({ symbol, name: '', type: 'IDX_STOCK' });
      }
    } else {
      setSymbol('');
      setSelectedAsset(null);
      setShares('');
      setAvgBuyPrice('');
    }
    setErrors({});
  }, [initialData, open]);

  const sharesInLembar = selectedAsset?.type === 'IDX_STOCK'
    ? Number(shares || 0) * 100
    : Number(shares || 0);
  const sharesNum = Number(shares || 0);
  const avgBuyPriceNum = Number(avgBuyPrice || 0);
  const totalCost = sharesInLembar * avgBuyPriceNum;
  const isEditMode = !!initialData;
  const isIncreasingShares = isEditMode && sharesNum > Number(initialData?.shares || 0);
  const additionalSharesNeeded = isIncreasingShares 
    ? (sharesNum - Number(initialData?.shares || 0)) * (selectedAsset?.type === 'IDX_STOCK' ? 100 : 1)
    : 0;
  const additionalCost = additionalSharesNeeded * avgBuyPriceNum;
  const canAfford = !isIncreasingShares || additionalCost <= availableBalance;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!symbol) newErrors.symbol = t('investment.assetRequired');
    if (!shares || Number(shares) <= 0) newErrors.shares = t('investment.sharesRequired');
    if (!avgBuyPrice || Number(avgBuyPrice) <= 0) newErrors.avgBuyPrice = t('investment.priceRequired');
    if (!canAfford) newErrors.shares = t('investment.insufficientBalance');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const sharesToSubmit = selectedAsset?.type === 'IDX_STOCK'
      ? (Number(shares) * 100).toString()
      : shares;

    await onSubmit({
      accountId: initialData?.accountId || '',
      symbol,
      shares: sharesToSubmit,
      avgBuyPrice,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('investment.editHolding') : t('investment.addAsset')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('investment.asset')}</label>
            <AssetSearch
              value={symbol}
              onChange={(sym, asset) => {
                setSymbol(sym);
                setSelectedAsset(asset);
              }}
              error={errors.symbol}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              {t('investment.shares')}
              {selectedAsset?.type === 'IDX_STOCK' && ' (Lot)'}
            </label>
            <Input
              type="number"
              step="any"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder={selectedAsset?.type === 'IDX_STOCK' ? '4' : '0.5'}
              className={errors.shares ? 'border-red-500' : ''}
            />
            {selectedAsset?.type === 'IDX_STOCK' ? (
              <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                Input dalam lot (1 lot = 100 lembar saham)
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">Jumlah unit yang dimiliki</p>
            )}
            {errors.shares && <p className="text-sm text-red-500 mt-1">{errors.shares}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">{t('investment.avgBuyPrice')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
              <Input
                type="number"
                step="any"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                placeholder="500000"
                className={`pl-10 ${errors.avgBuyPrice ? 'border-red-500' : ''}`}
              />
            </div>
            {avgBuyPrice && (
              <p className="text-xs text-muted-foreground mt-1">
                Rp {Number(avgBuyPrice).toLocaleString('id-ID')} per unit
              </p>
            )}
            {errors.avgBuyPrice && <p className="text-sm text-red-500 mt-1">{errors.avgBuyPrice}</p>}
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('investment.totalCost')}</span>
              <span className="font-medium">Rp {(isNaN(totalCost) ? 0 : totalCost).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t('investment.availableCash')}</span>
              <span className="font-medium">Rp {availableBalance.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !canAfford}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
