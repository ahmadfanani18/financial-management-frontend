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
    try {
      const result = await aiService.suggestSavings();
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
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menganalisis...
            </>
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
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Sisa Saldo Bulan Ini</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.currentBalance.toLocaleString('id-ID')}
                  </p>
                </div>
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