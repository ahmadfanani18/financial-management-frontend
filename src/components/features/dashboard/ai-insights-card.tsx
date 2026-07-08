'use client';

import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Target, Percent, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AiInsightsCardProps {
  isHidden: boolean;
  summary?: { income: number; expense: number };
}

export function AiInsightsCard({ isHidden, summary }: AiInsightsCardProps) {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {savingRate !== null ? (
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <Percent className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Saving Rate</p>
              <p className="text-sm text-muted-foreground">
                {savingRate}% bulan ini
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-muted">
              <Percent className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saving Rate</p>
              <p className="text-sm text-muted-foreground">Data belum cukup</p>
            </div>
          </div>
        )}

        {!predictError && predictData?.predictions?.[0] ? (
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{predictData.predictions[0].category}</p>
              <p className="text-sm text-muted-foreground">
                Spending terbesar: {isHidden ? '••••••••' : `Rp ${predictData.predictions[0].predictedAmount.toLocaleString('id-ID')}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-muted">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Spending Terbesar</p>
              <p className="text-sm text-muted-foreground">
                {predictError ? 'Insights tidak tersedia saat ini' : 'Data belum cukup'}
              </p>
            </div>
          </div>
        )}

        {!savingsError && savingsData?.suggestions?.[0] ? (
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Fokus: {savingsData.suggestions[0].category}</p>
              <p className="text-sm text-muted-foreground">
                Simpan {isHidden ? '••••••••' : `Rp ${savingsData.suggestions[0].suggestedSaving.toLocaleString('id-ID')}`}/bulan
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-muted">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fokus Tabungan</p>
              <p className="text-sm text-muted-foreground">
                {savingsError ? 'Insights tidak tersedia saat ini' : 'Data belum cukup'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}