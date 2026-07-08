'use client';

import { useState, useEffect } from 'react';
import { investmentService } from '@/services/investment.service';
import { useI18n } from '@/components/i18n/i18n-provider';
import { toast } from 'sonner';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: Holding | null;
  onSuccess: () => void;
}

export function SellModal({ isOpen, onClose, holding, onSuccess }: SellModalProps) {
  const { t } = useI18n();
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState('');
  const [sellDate, setSellDate] = useState(new Date().toISOString().split('T')[0]);
  const [brokerFee, setBrokerFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const maxLots = holding ? Math.floor(holding.quantity / 100) : 0;
  const sharesPerLot = 100;

  useEffect(() => {
    if (holding) {
      setQuantity(1);
      setSellPrice('');
      setSellDate(new Date().toISOString().split('T')[0]);
      setBrokerFee(0);
      setError('');
    }
  }, [holding]);

  if (!isOpen || !holding) return null;

  const sharesToSell = quantity * sharesPerLot;
  const sellPriceNum = parseFloat(sellPrice) || 0;
  const grossProceeds = sharesToSell * sellPriceNum;
  const netProceeds = grossProceeds - brokerFee;
  const costBasis = sharesToSell * holding.avgBuyPrice;
  const realizedPnL = netProceeds - costBasis;
  const isProfit = realizedPnL >= 0;

  const handleSubmit = async () => {
    if (!sellPrice) {
      setError(t('investment.sellPriceRequired'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await investmentService.sellHolding(holding.id, {
        quantity,
        sellPrice: sellPriceNum,
        sellDate,
        brokerFee,
      });

      toast.success(t('investment.sellSuccess', { symbol: result.symbol, pnl: result.realizedPnL.toLocaleString('id-ID') }));

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('investment.sellFailed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {t('investment.sellAsset', { symbol: holding.symbol })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('investment.sellRecording')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('investment.currentPosition')}</span>
            <span className="font-medium text-gray-800 dark:text-gray-100">
              {maxLots} lot @ {holding.currentPrice.toLocaleString('id-ID')}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('investment.quantityToSell')}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxLots, parseInt(e.target.value) || 1)))}
              min={1}
              max={maxLots}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('investment.lotInfo', { max: maxLots })}
            </p>
            {quantity < maxLots && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {t('investment.remaining', { remaining: maxLots - quantity })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('investment.sellPrice')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-400">Rp</span>
              <input
                type="number"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder={t('investment.enterSellPrice')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('investment.sellDate')}
            </label>
            <input
              type="date"
              value={sellDate}
              onChange={(e) => setSellDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {t('investment.brokerFee')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-400">Rp</span>
              <input
                type="number"
                value={brokerFee || ''}
                onChange={(e) => setBrokerFee(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          <div className={`${isProfit ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('investment.realizedPnL')}</span>
              <span className={`text-xl font-bold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isProfit ? '+' : ''}{realizedPnL.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{t('investment.proceedsGross')}</span>
              <span>{grossProceeds.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{t('investment.avgBuy')}</span>
              <span>{(costBasis).toLocaleString('id-ID')}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
              <span>{t('investment.brokerFeeLabel')}</span>
              <span>-{brokerFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between font-medium pt-1 border-t border-gray-200 dark:border-gray-700">
              <span>{t('investment.proceedsNet')}</span>
              <span className={isProfit ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {netProceeds.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium disabled:opacity-50"
          >
            {isLoading ? t('investment.processing') : t('investment.confirmSell')}
          </button>
        </div>
      </div>
    </div>
  );
}
