'use client';

import { useState } from 'react';
import { PiggyBank, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiService, SuggestSavingsResponse } from '@/services/ai.service';

export function SuggestSavingsCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SuggestSavingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async () => {
    setIsLoading(true);
    setError(null);

    const suggestPromise = aiService.suggestSavings();
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const [result] = await Promise.all([suggestPromise, delayPromise]);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Saran Tabungan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSuggest} 
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
              AI sedang menganalisis...
            </span>
          ) : (
            <>
              <PiggyBank className="mr-2 h-4 w-4" />
              Dapatkan Saran Tabungan
            </>
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Pemasukan</p>
                    <p className="text-sm font-bold text-green-600">{data.monthlyIncome.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Pengeluaran</p>
                    <p className="text-sm font-bold text-red-600">{data.monthlyExpenses.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sisa Bulan Ini</p>
                      <p className="text-lg font-bold text-green-600">
                        {data.currentBalance.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Akun</p>
                    <p className="text-sm font-medium">{data.totalAccountBalance.toLocaleString('id-ID')}</p>
                    {data.activeGoalsCount > 0 && (
                      <p className="text-xs text-blue-600">{data.activeGoalsCount} Goal aktif</p>
                    )}
                  </div>
                </div>

            {data.suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Saran untuk Anda:</p>
                {data.suggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    className="p-3 border rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{suggestion.category}</span>
                      <span className="text-sm font-medium text-green-600">
                        +{suggestion.suggestedSaving.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                Pertahankan kebiasaan keuangan Anda yang baik!
              </div>
            )}

            <p className="text-xs text-muted-foreground">{data.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}