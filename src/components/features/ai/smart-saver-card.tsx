'use client';

import { useState } from 'react';
import { Target, Loader2, AlertCircle, CheckCircle2, History, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { aiService, SmartSaverResult, SmartSaverSuggestion } from '@/services/ai.service';
import { goalService } from '@/services/goal.service';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { useI18n } from '@/components/i18n/i18n-provider';
import { useRouter } from 'next/navigation';

type Mode = 'input' | 'result' | 'history';

export function SmartSaverCard() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [itemName, setItemName] = useState('');
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [result, setResult] = useState<SmartSaverResult | null>(null);
  const [suggestions, setSuggestions] = useState<SmartSaverSuggestion[]>([]);

  const handleAnalyze = async () => {
    if (!targetPrice || targetPrice <= 0) {
      setError('Masukkan target harga yang valid');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await aiService.smartSaverCalculate({
        itemName: itemName || undefined,
        targetPrice,
        monthlyBudget: monthlyBudget || undefined,
      });
      setResult(res);
      setMode('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await aiService.getSmartSaverSuggestions();
      setSuggestions(res.suggestions);
      setMode('history');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (suggestion: SmartSaverSuggestion) => {
    setItemName(suggestion.name);
    setTargetPrice(suggestion.estimatedPrice);
    setMode('input');
    handleAnalyze();
  };

  const handleCreateGoal = async () => {
    if (!result) return;

    setIsCreatingGoal(true);
    setError(null);

    try {
      const targetDate = new Date(result.targetDate);
      await goalService.create({
        name: itemName || 'Target Menabung',
        targetAmount: targetPrice,
        deadline: targetDate.toISOString().split('T')[0],
        icon: 'target',
        color: '#10B981',
      });

      router.push('/goals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const handleReset = () => {
    setMode('input');
    setItemName('');
    setTargetPrice(0);
    setMonthlyBudget(0);
    setResult(null);
    setError(null);
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'safe': return 'bg-green-100 text-green-700';
      case 'tight': return 'bg-yellow-100 text-yellow-700';
      case 'aggressive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t('ai.smartSaverTitle') || 'Rekomendasi Target Menabung'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
{mode === 'input' && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="itemName">{t('ai.smartSaver.itemName') || 'Nama Barang'}</Label>
                <Input
                  id="itemName"
                  placeholder={t('ai.smartSaver.itemPlaceholder') || 'Contoh: iPhone 16'}
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="targetPrice">{t('ai.smartSaver.targetPrice') || 'Target Harga (Rp)'}</Label>
                <Input
                  id="targetPrice"
                  type="text"
                  placeholder={t('common.amountPlaceholder') || '0'}
                  value={targetPrice ? formatCurrency(targetPrice) : ''}
                  onChange={(e) => setTargetPrice(parseCurrency(e.target.value))}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="monthlyBudget">{t('ai.smartSaver.monthlyBudget') || 'Tabungan/Bulan (Rp)'}</Label>
                <Input
                  id="monthlyBudget"
                  type="text"
                  placeholder={t('ai.smartSaver.optional') || 'Opsional'}
                  value={monthlyBudget ? formatCurrency(monthlyBudget) : ''}
                  onChange={(e) => setMonthlyBudget(parseCurrency(e.target.value))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('ai.analyzing') || 'Menganalisis...'}
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    {t('ai.analyze') || 'Analisis'}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleShowHistory}
                disabled={isLoading}
              >
                <History className="mr-2 h-4 w-4" />
                {t('ai.fromHistory') || 'Dari Histori'}
              </Button>
            </div>
          </>
        )}

        {mode === 'history' && (
          <>
            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition"
                    onClick={() => handleSelectFromHistory(suggestion)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-lg">
                        📦
                      </div>
                      <div>
                        <p className="font-medium">{suggestion.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.merchant} • {formatDate(suggestion.lastTransactionDate)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      suggestion.estimatedMonths <= 2 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      Est. {suggestion.estimatedMonths} bulan
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t('ai.noSuggestions') || 'Tidak ada suggestion dari histori'}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setMode('input')}>
                <Plus className="mr-2 h-4 w-4" />
                {t('ai.inputManual') || 'Input Manual'}
              </Button>
            </div>
          </>
        )}

        {mode === 'result' && result && (
          <>
            <div className="flex items-center gap-6 pb-4 border-b">
              <div className="relative flex-shrink-0">
                <svg className="progress-ring w-20 h-20" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                  <circle
                    cx="40" cy="40" r="32"
                    stroke={result.feasibility === 'safe' ? '#10B981' : result.feasibility === 'tight' ? '#F59E0B' : '#EF4444'}
                    strokeWidth="6" fill="none"
                    strokeDasharray="201"
                    strokeDashoffset={201 - (201 * result.progress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{result.progress}%</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{itemName || 'Target Menabung'}</p>
                  <p className="text-sm text-muted-foreground">
                    Target: {formatCurrency(targetPrice)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getFeasibilityColor(result.feasibility)}`}>
                  {result.feasibility === 'safe' ? 'Aman' : result.feasibility === 'tight' ? 'Tight' : 'Aggressive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Sisa Needed</p>
                <p className="text-lg font-bold">{formatCurrency(result.remainingNeeded)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">per Bulan</p>
                <p className="text-lg font-bold">{formatCurrency(result.monthlyNeeded)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estimasi Jadi</p>
                <p className="text-lg font-bold text-green-600">{result.estimatedMonths} Bulan</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span>📅 Mulai: {formatDate(result.startDate)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">🎯 Target: {formatDate(result.targetDate)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="flex gap-2">
                <span>💡</span>
                <p className="text-sm text-blue-900">{result.insight}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreateGoal}
                disabled={isCreatingGoal}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isCreatingGoal ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {t('ai.saveAsGoal') || 'Simpan sebagai Goal'}
              </Button>

              <Button variant="outline" onClick={handleReset}>
                {t('ai.reset') || 'Reset'}
              </Button>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}