'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiService, PredictSpendingResponse } from '@/services/ai.service';
import { useI18n } from '@/components/i18n/i18n-provider';

export function PredictSpendingCard() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PredictSpendingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);

    const predictPromise = aiService.predictSpending({ months: 3 });
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const [result] = await Promise.all([predictPromise, delayPromise]);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getConfidenceColor = (confidence: string) => {
    if (confidence === 'high') return 'bg-green-100 text-green-800';
    if (confidence === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{t('ai.predictSpendingTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handlePredict} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {t('ai.aiAnalyzing')}
            </span>
          ) : (
            t('ai.predictSpendingButton')
          )}
        </Button>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

{data && (
              <div className="space-y-3">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">{t('ai.predicted')}</p>
                    <p className="text-sm font-bold">{data.totalPredicted.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">{t('ai.budget')}</p>
                    <p className="text-sm font-bold">{data.totalBudget.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">{t('ai.spent')}</p>
                    <p className="text-sm font-bold">{data.totalSpent.toLocaleString('id-ID')}</p>
                  </div>
                </div>

            {data.insufficientData ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg">
                {data.message}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('ai.byCategory')}</p>
                {data.predictions.slice(0, 5).map((pred) => (
                  <div 
                    key={pred.category}
                    className={`flex items-center justify-between p-2 border rounded-lg ${pred.isOverBudget ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      {getTrendIcon(pred.trend)}
                      <span className="text-sm">{pred.category}</span>
                      {pred.isOverBudget && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">{t('ai.overBudget')}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {pred.predictedAmount.toLocaleString('id-ID')}
                      </p>
                      {pred.budgetLimit && (
                        <p className="text-xs text-muted-foreground">Budget: {pred.budgetLimit.toLocaleString('id-ID')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{data.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}