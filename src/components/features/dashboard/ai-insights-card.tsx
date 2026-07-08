'use client';

import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, TrendingDown, Minus, Target, Percent, AlertCircle, Info, Wallet, PiggyBank } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/components/i18n/i18n-provider';

interface AiInsightsCardProps {
  isHidden: boolean;
  summary?: { income: number; expense: number };
}

function formatCurrency(amount: number, isHidden: boolean): string {
  if (isHidden) return '••••••••';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function TrendBadge({ trend, confidence }: { trend: string | null; confidence: string }) {
  const { t } = useI18n();
  if (trend === 'increasing') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
        <TrendingUp className="h-3 w-3" /> {t('aiInsights.trend.increasing')}
      </span>
    );
  }
  if (trend === 'decreasing') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <TrendingDown className="h-3 w-3" /> {t('aiInsights.trend.decreasing')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
      <Minus className="h-3 w-3" /> {t('aiInsights.trend.stable')}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const { t } = useI18n();
  const colors = {
    high: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    low: 'bg-muted text-muted-foreground',
  };
  const labels = {
    high: t('aiInsights.confidence.high'),
    medium: t('aiInsights.confidence.medium'),
    low: t('aiInsights.confidence.low'),
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs ${colors[confidence as keyof typeof colors] || colors.low}`}>
      {labels[confidence as keyof typeof labels] || labels.low}
    </span>
  );
}

function getSavingRateMessage(rate: number, t: (key: string) => string): { text: string; color: string } {
  if (rate >= 30) {
    return { text: t('aiInsights.savingRateMessage.excellent'), color: 'text-green-600 dark:text-green-400' };
  }
  if (rate >= 20) {
    return { text: t('aiInsights.savingRateMessage.good'), color: 'text-green-600 dark:text-green-400' };
  }
  if (rate >= 10) {
    return { text: t('aiInsights.savingRateMessage.fair'), color: 'text-amber-600 dark:text-amber-400' };
  }
  if (rate > 0) {
    return { text: t('aiInsights.savingRateMessage.needsAttention'), color: 'text-red-600 dark:text-red-400' };
  }
  return { text: t('aiInsights.savingRateMessage.overspending'), color: 'text-red-600 dark:text-red-400' };
}

export function AiInsightsCard({ isHidden, summary }: AiInsightsCardProps) {
  const { t } = useI18n();
  const { data: predictData, isLoading: loadingPredict, isError: predictError } = useQuery({
    queryKey: ['ai', 'predict-spending'],
    queryFn: () => aiService.predictSpending({ months: 1 }),
    enabled: !!summary,
  });

  const { data: savingsData, isLoading: loadingSavings, isError: savingsError } = useQuery({
    queryKey: ['ai', 'suggest-savings'],
    queryFn: () => aiService.suggestSavings(),
  });

  const isLoading = loadingPredict || loadingSavings;

  const savingRate = summary && summary.income > 0
    ? Math.round(((summary.income - summary.expense) / summary.income) * 100)
    : null;

  const savedAmount = summary && summary.income > 0
    ? summary.income - summary.expense
    : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const firstPrediction = predictData?.predictions?.[0];
  const firstSuggestion = savingsData?.suggestions?.[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          {t('aiInsights.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saving Rate Section */}
        {savingRate !== null && savedAmount !== null && summary ? (
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Percent className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('aiInsights.savingRate')}</p>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{savingRate}%</span>
                </div>
                <p className={`text-xs ${getSavingRateMessage(savingRate, t).color}`}>
                  {getSavingRateMessage(savingRate, t).text}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-green-700 dark:text-green-500">
                  <span>{t('aiInsights.savings')}: {formatCurrency(savedAmount, isHidden)}</span>
                  <span className="text-green-400">•</span>
                  <span>{t('aiInsights.income')}: {formatCurrency(summary.income, isHidden)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 dark:bg-muted/20 border border-muted">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Percent className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('aiInsights.savingRate')}</p>
                <p className="text-xs text-muted-foreground">{t('aiInsights.noIncomeData')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Spending Prediction Section */}
        {firstPrediction && !predictError ? (
          <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-100 dark:border-orange-900">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-1 mb-1">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">{firstPrediction.category}</p>
                  <TrendBadge trend={firstPrediction.trend} confidence={firstPrediction.confidence} />
                </div>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                  {formatCurrency(firstPrediction.predictedAmount, isHidden)}
                  <span className="text-xs font-normal text-orange-600 dark:text-orange-500 ml-1">{t('aiInsights.perMonth')}</span>
                </p>
                {firstPrediction.expenseType && (
                  <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                    {firstPrediction.expenseType === 'recurring' ? t('aiInsights.recurring') : t('aiInsights.occasional')}
                  </p>
                )}
                {predictData?.message && (
                  <div className="mt-2 flex items-start gap-1.5 p-2 rounded bg-white/60 dark:bg-background/60 text-xs text-orange-700 dark:text-orange-400">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{predictData.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 dark:bg-muted/20 border border-muted">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('aiInsights.spendingPrediction')}</p>
                <p className="text-xs text-muted-foreground">
                  {predictError ? t('aiInsights.insightsUnavailable') : t('aiInsights.notEnoughData')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Savings Suggestion Section */}
        {firstSuggestion && !savingsError ? (
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{t('aiInsights.focus')}: {firstSuggestion.category}</p>
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(firstSuggestion.suggestedSaving, isHidden)}
                  <span className="text-xs font-normal text-blue-600 dark:text-blue-500 ml-1">{t('aiInsights.perMonth')}</span>
                </p>
                {firstSuggestion.reason && (
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 line-clamp-2">{firstSuggestion.reason}</p>
                )}
                {savingsData && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-600 dark:text-blue-500">
                    {savingsData.totalAccountBalance > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        {t('aiInsights.balance')}: {formatCurrency(savingsData.totalAccountBalance, isHidden)}
                      </span>
                    )}
                    {savingsData.activeGoalsCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <PiggyBank className="h-3 w-3" />
                        {savingsData.activeGoalsCount} {t('aiInsights.activeGoals')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 dark:bg-muted/20 border border-muted">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('aiInsights.savingsSuggestion')}</p>
                <p className="text-xs text-muted-foreground">
                  {savingsError ? t('aiInsights.insightsUnavailable') : t('aiInsights.addTransactionForBetter')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Predictions Count */}
        {predictData?.predictions && predictData.predictions.length > 1 && (
          <div className="text-xs text-center text-muted-foreground">
            +{predictData.predictions.length - 1} {t('aiInsights.otherCategories', { count: predictData.predictions.length - 1 })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
